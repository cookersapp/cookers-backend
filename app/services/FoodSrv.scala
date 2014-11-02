package services

import common.Utils
import dao.ProductsDao
import dao.AdditivesDao
import models.food.Product
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import models.food.dataImport.AdditifAlimentairesAdditive
import models.food.dataImport.PrixingAdditive
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

object FoodSrv {
  def getAllProducts()(implicit db: DB): Future[List[Product]] = {
    ProductsDao.getAllCookers().flatMap { products =>
      val results = products.map { product =>
        val future: Future[(Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
          openfoodfacts <- ProductsDao.getOpenFoodFacts(product.barcode)
          prixing <- ProductsDao.getPrixingProduct(product.barcode)
        } yield (openfoodfacts, prixing)

        future.map { case (openfoodfacts, prixing) => Product.mergeSources(Some(product), openfoodfacts, prixing) }
      }
      Future.sequence(results).map(d => d.flatten)
    }
  }

  def getProduct(barcode: String)(implicit db: DB): Future[Option[Product]] = {
    val future: Future[(Option[CookersProduct], Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
      cookers <- getCookersProduct(barcode)
      openfoodfacts <- getOpenFoodFactsProduct(barcode)
      prixing <- getPrixingProduct(barcode)
    } yield (cookers, openfoodfacts, prixing)

    future.map { case (cookers, openfoodfacts, prixing) => Product.mergeSources(cookers, openfoodfacts, prixing) }
  }

  def getAllCookersProduct()(implicit db: DB): Future[List[CookersProduct]] = ProductsDao.getAllCookers()
  def getCookersProduct(barcode: String)(implicit db: DB): Future[Option[CookersProduct]] = {
    ProductsDao.getCookers(barcode).map { opt =>
      if (opt.isDefined) {
        opt
      } else {
        val product = CookersProduct.create(barcode)
        ProductsDao.insertCookers(product)
        Some(product)
      }
    }
  }

  def getAllOpenFoodFactsProduct()(implicit db: DB): Future[List[OpenFoodFactsProduct]] = ProductsDao.getAllOpenFoodFacts()
  def getOpenFoodFactsProduct(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] = {
    ProductsDao.getOpenFoodFacts(barcode).flatMap { opt =>
      if (opt.isDefined && opt.get.isValid) {
        Future.successful(opt)
      } else {
        WS.url(OpenFoodFactsProduct.getUrl(barcode)).get().map { response =>
          OpenFoodFactsProduct.create(barcode, response.json).map { productFormated =>
            ProductsDao.saveOpenFoodFacts(barcode, response.json, productFormated)
            Some(productFormated)
          }.getOrElse(None)
        }
      }
    }
  }

  def getAllPrixingProduct()(implicit db: DB): Future[List[PrixingProduct]] = ProductsDao.getPrixingProducts()
  def getPrixingProduct(barcode: String)(implicit db: DB): Future[Option[PrixingProduct]] = {
    ProductsDao.getPrixingProduct(barcode).flatMap { opt =>
      if (opt.isDefined && opt.get.isValid) {
        Future.successful(opt)
      } else {
        WS.url(PrixingProduct.getUrl(barcode)).get().map { response =>
          PrixingProduct.create(barcode, response.body).map { productFormated =>
            ProductsDao.savePrixingProduct(barcode, response.body, productFormated)
            Some(productFormated)
          }.getOrElse(None)
        }
      }
    }.flatMap(opt => Utils.transform(opt.map { product =>
      // get additives and add them to product
      if (product.additives.isDefined) {
        val loadAdditives = product.additives.get.map { additive => getPrixingAdditive(additive.id, additive.fullName) }
        Future.sequence(loadAdditives).map(additives => new PrixingProduct(product, additives))
      } else {
        Future.successful(product)
      }
    }))
  }

  private def getPrixingAdditive(prixingId: String, fullName: String)(implicit db: DB): Future[PrixingAdditive] = {
    val reference = PrixingAdditive.reference(fullName)
    AdditivesDao.getPrixingAdditive(reference).flatMap { opt =>
      if (opt.isDefined && opt.get.isValid) {
        Future.successful(opt.get)
      } else {
        WS.url(PrixingAdditive.getUrl(prixingId)).get().map { response =>
          PrixingAdditive.create(prixingId, response.body).map { additiveFormated =>
            AdditivesDao.savePrixingAdditive(reference, response.body, additiveFormated)
            additiveFormated
          }.getOrElse(new PrixingAdditive(prixingId, fullName))
        }
      }
    }
  }

  def getAdditifAlimentairesAdditive(reference: String)(implicit db: DB): Future[Option[AdditifAlimentairesAdditive]] = {
    AdditivesDao.getAdditifAlimentairesAdditive(reference).flatMap { opt =>
      if (opt.isDefined && opt.get.isValid) {
        Future.successful(opt)
      } else {
        WS.url(AdditifAlimentairesAdditive.getSearchUrl(reference)).get().flatMap { response =>
          AdditifAlimentairesAdditive.getIdFromSearch(reference, response.body).map { id =>
            WS.url(AdditifAlimentairesAdditive.getUrl(id)).get().map { response =>
              val content = new String(response.body.getBytes("ISO-8859-1"), "UTF-8")
              AdditifAlimentairesAdditive.create(id, content).map { additiveFormated =>
                AdditivesDao.saveAdditifAlimentairesAdditive(reference, content, additiveFormated)
                additiveFormated
              }
            }
          }.getOrElse(Future.successful(None))
        }
      }
    }
  }
}
