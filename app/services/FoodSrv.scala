package services

import dao.ProductsDao
import models.food.Product
import models.food.dataImport.PrixingProduct
import models.food.dataImport.OpenFoodFactsProduct
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

object FoodSrv {
  def getProduct(barcode: String)(implicit db: DB): Future[Option[Product]] = {
    val future: Future[(Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
      openfoodfacts <- getOpenFoodFactsProduct(barcode)
      prixing <- getPrixingProduct(barcode)
    } yield (openfoodfacts, prixing)

    future.map { case (openfoodfacts, prixing) => Product.mergeSources(openfoodfacts, prixing) }
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