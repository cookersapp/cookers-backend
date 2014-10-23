package common

import models.Product
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._

object OpenFoodFacts {
  val baseUrl = "http://fr.openfoodfacts.org"
  val databaseUrl = baseUrl + "/data/fr.openfoodfacts.org.products.csv"
  def productUrl(barcode: String) = baseUrl + "/api/v0/produit/" + barcode + ".json"

  def getProduct(barcode: String): Future[Option[Product]] = {
    WS.url(productUrl(barcode)).get().map { response =>
      Product.create(response.json)
    }
  }

  def getDatabase(): Future[List[Product]] = {
    WS.url(databaseUrl).withTimeout(1200000).get().map { response =>
      val lines = response.body.split("\n").tail.toList
      lines.map(line => Product.create(line.split("\t"))).filter(opt => opt.isDefined).map(opt => opt.get)
    }
  }
}