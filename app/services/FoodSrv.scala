package services

import dao.ProductsDao
import models.food.Product
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

object FoodSrv {
  def getProduct(barcode: String)(implicit db: DB): Future[Option[Product]] = {
    val future: Future[(Option[CookersProduct], Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
      cookers <- getCookersProduct(barcode)
      openfoodfacts <- getOpenFoodFactsProduct(barcode)
      prixing <- getPrixingProduct(barcode)
    } yield (cookers, openfoodfacts, prixing)

    future.map { case (cookers, openfoodfacts, prixing) => Product.mergeSources(cookers, openfoodfacts, prixing) }
  }

  def getCookersProduct(barcode: String)(implicit db: DB): Future[Option[CookersProduct]] = {
    ProductsDao.getCookers(barcode).map { opt =>
      if (opt.isEmpty) {
        val productOpt = CookersProduct.create(barcode)
        ProductsDao.insertCookers(productOpt)
        Some(productOpt)
      } else {
        opt
      }
    }
  }

  def openFoodFactsUrl(barcode: String): String = "http://fr.openfoodfacts.org/api/v0/produit/" + barcode + ".json"
  def getOpenFoodFactsProduct(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] = {
    ProductsDao.getOpenFoodFacts(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(OpenFoodFactsProduct.create(barcode, opt.get))
      } else {
        WS.url(openFoodFactsUrl(barcode)).get().map { response =>
          val productOpt = OpenFoodFactsProduct.create(barcode, response.json)
          if (productOpt.isDefined) {
            ProductsDao.insertOpenFoodFacts(barcode, response.json)
          }
          productOpt
        }
      }
    }
  }

  def prixingUrl(barcode: String): String = "http://www.prixing.fr/products/" + barcode
  def getPrixingProduct(barcode: String)(implicit db: DB): Future[Option[PrixingProduct]] = {
    ProductsDao.getPrixing(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(PrixingProduct.create(barcode, opt.get))
      } else {
        WS.url(prixingUrl(barcode)).get().map { response =>
          val productOpt = PrixingProduct.create(barcode, response.body)
          if (productOpt.isDefined) {
            ProductsDao.insertPrixing(barcode, response.body)
          }
          productOpt
        }
      }
    }
  }
}