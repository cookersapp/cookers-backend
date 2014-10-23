package controllers

import models.Quantity
import models.Product
import common.OpenFoodFacts
import scala.concurrent.Future
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.ws._
import play.api.mvc.Action
import play.api.mvc.Controller
import play.modules.reactivemongo.MongoController
import scala.util.Random

object Products extends Controller with MongoController {
  implicit val DB = db

  def get(barcode: String) = Action { request =>
    Async {
      OpenFoodFacts.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          Ok(Json.obj("status" -> 200, "data" -> Json.toJson(productOpt.get)))
        }
      }
    }
  }

  def getWithStore(storeId: String, barcode: String) = Action { request =>
    Async {
      OpenFoodFacts.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          val product: JsValue = Json.toJson(productOpt.get)
          val store: JsObject = Json.obj("store" ->
            Json.obj(
              "id" -> storeId,
              "price" -> Json.obj("value" -> new Random().nextDouble() * 3, "currency" -> "€"),
              "genericPrice" -> Json.obj("value" -> new Random().nextDouble() * 10, "currency" -> "€", "unit" -> "kg")))

          val addStore = (__).json.update(__.read[JsObject].map { originalData => originalData ++ store })
          val data: JsValue = product.transform(addStore).get
          Ok(Json.obj("status" -> 200, "data" -> data))
        }
      }
    }
  }

  /*def loadProductsFromOpenFoodFacts = Action {
    Async {
      OpenFoodFacts.getDatabase().map { products =>
        val quantities = products.filter(p => p.quantity.isEmpty).map(p => p.quantityStr).groupBy(q => q).map { case (value, list) => (value, list.length) }
        val quantitiesByFreq = quantities.groupBy { case (value, freq) => freq.toString }
        val quantitiesFormated = quantitiesByFreq.map(a => (a._1, a._2.map(b => (b._1, Quantity.create(b._1)))))
        val brands = products.map(p => p.brand.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val brandsByFreq = brands.groupBy { case (value, freq) => freq.toString }
        val categories = products.map(p => p.category.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val categoriesByFreq = categories.groupBy { case (value, freq) => freq.toString }

        Ok(Json.obj(
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
            "data" -> categoriesByFreq)))

        //ProductsDao.drop().flatMap { dropped =>
        //  val results = products.map { product => ProductsDao.insert(product) }
        //  Future.sequence(results).flatMap { errors =>
        //    ProductsDao.count().map { count =>
        //      Ok(Json.obj("status" -> 200, "message" -> (count + " products saved !")))
        //    }
        // }
        //}
      }
    }
  }*/
}
