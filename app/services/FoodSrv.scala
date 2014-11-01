package services

import dao.ProductsDao
import models.food.Product
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
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
          prixing <- ProductsDao.getPrixing(product.barcode)
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

  def openFoodFactsUrl(barcode: String): String = "http://fr.openfoodfacts.org/api/v0/produit/" + barcode + ".json"
  def getAllOpenFoodFactsProduct()(implicit db: DB): Future[List[OpenFoodFactsProduct]] = ProductsDao.getAllOpenFoodFacts()
  def getOpenFoodFactsProduct(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] = {
    ProductsDao.getOpenFoodFacts(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(opt)
      } else {
        Logger.info("Load openfoodfacts for " + barcode)
        WS.url(openFoodFactsUrl(barcode)).get().flatMap { response =>
          ProductsDao.saveOpenFoodFacts(barcode, response.json)
        }
      }
    }
  }

  def prixingUrl(barcode: String): String = "http://www.prixing.fr/products/" + barcode
  def getAllPrixingProduct()(implicit db: DB): Future[List[PrixingProduct]] = ProductsDao.getAllPrixing()
  def getPrixingProduct(barcode: String)(implicit db: DB): Future[Option[PrixingProduct]] = {
    ProductsDao.getPrixing(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(opt)
      } else {
        Logger.info("Load prixing for " + barcode)
        WS.url(prixingUrl(barcode)).get().flatMap { response =>
          ProductsDao.savePrixing(barcode, response.body)
        }
      }
    }
  }
}