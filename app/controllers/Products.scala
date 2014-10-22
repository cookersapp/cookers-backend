package controllers

import models.Product
import dao.ProductsDao
import scala.concurrent.Future
import play.api.libs.json.Json
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.ws._
import play.api.mvc.Action
import play.api.mvc.Controller
import play.modules.reactivemongo.MongoController

object Products extends Controller with MongoController {
  implicit val DB = db

  // get all products
  def getAll = Action { implicit request =>
    Async {
      ProductsDao.all().map { products => Ok(Json.obj("status" -> 200, "data" -> products)) }
    }
  }

  // get product with barcode
  def get(barcode: String) = Action { request =>
    Async {
      ProductsDao.findByBarcode(barcode).map {
        case Some(product) => Ok(Json.toJson(product))
        case None => NotFound(Json.obj("status" -> 404, "message" -> "Product not found !"))
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

        val results = products.map { product => ProductsDao.insert(product) }
        Future.sequence(results).map { errors =>
          Ok(Json.obj("status" -> 200, "message" -> "products saved !"))
        }
      }
    }
  }
}
