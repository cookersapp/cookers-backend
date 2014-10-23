package controllers

import models.Product
import dao.ProductsDao
import scala.concurrent.Future
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.ws._
import play.api.mvc.Action
import play.api.mvc.Controller
import play.modules.reactivemongo.MongoController

object Products extends Controller with MongoController {
  implicit val DB = db

  def getFromOFF(barcode: String) = Action { request =>
    Async {
      WS.url("http://fr.openfoodfacts.org/api/v0/produit/" + barcode + ".json").get().map { response =>
        val product = Product.create(response.json)
        if (product.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          val data: JsValue = Json.toJson(product.get)
          Ok(Json.obj("status" -> 200, "data" -> data))
        }
      }
    }
  }

  // get all products
  def getAll = Action { implicit request =>
    Async {
      ProductsDao.all().map { products => Ok(Json.obj("status" -> 200, "data" -> products)) }
    }
  }

  // get product with barcode (ex: 3535710002787)
  def get(barcode: String) = Action { request =>
    Async {
      ProductsDao.findByBarcode(barcode).map {
        case Some(product) => Ok(Json.obj("status" -> 200, "data" -> product))
        case None => Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
      }
    }
  }

  def loadOpenFoodFactsProducts = Action {
    val productsUrl = "http://fr.openfoodfacts.org/data/fr.openfoodfacts.org.products.csv"
    Async {
      WS.url(productsUrl).withTimeout(1200000).get().flatMap { response =>
        val lines = response.body.split("\n").tail.toList
        val products = lines.map(line => Product.create(line.split("\t"))).filter(p => p.isDefined).map(opt => opt.get)
        /*val quantities = products.filter(p => p.quantity.isEmpty).map(p => p.quantityStr).groupBy(q => q).map { case (value, list) => (value, list.length) }
        val quantitiesByFreq = quantities.groupBy { case (value, freq) => freq.toString }
        val quantitiesFormated = quantitiesByFreq.map(a => (a._1, a._2.map(b => (b._1, Quantity.create(b._1)))))
        val brands = products.map(p => p.brand.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val brandsByFreq = brands.groupBy { case (value, freq) => freq.toString }
        val categories = products.map(p => p.category.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val categoriesByFreq = categories.groupBy { case (value, freq) => freq.toString }

        Ok(Json.obj(
          "lines" -> lines.size,
          "products" -> products.size,
          "data" -> products,
          "quantities" -> Json.obj(
            "distinct" -> quantities.size,
            "data" -> quantitiesFormated),
          "brands" -> Json.obj(
            "distinct" -> brands.size,
            "data" -> brandsByFreq),
          "categories" -> Json.obj(
            "distinct" -> categories.size,
            "data" -> categoriesByFreq)))*/

        ProductsDao.drop().flatMap { dropped =>
          val results = products.map { product => ProductsDao.insert(product) }
          Future.sequence(results).flatMap { errors =>
            ProductsDao.count().map { count =>
              Ok(Json.obj("status" -> 200, "message" -> (count + " products saved !")))
            }
          }
        }
      }
    }
  }
}
