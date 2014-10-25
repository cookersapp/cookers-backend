package controllers

import models.food.Product
import models.food.Price
import models.food.Quantity
import common.OpenFoodFacts
import common.Prixing
import common.OpenFoodFactsProduct
import common.PrixingProduct
import dao.ProductsDao
import scala.util.Random
import scala.concurrent.Future
import play.api.Logger
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.ws._
import play.api.mvc.Action
import play.api.mvc.Controller
import play.modules.reactivemongo.MongoController

object Products extends Controller with MongoController {
  implicit val DB = db

  def get(barcode: String) = Action { request =>
    Async {
      val future: Future[(Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
        openfoodfacts <- OpenFoodFacts.getProduct(barcode)
        prixing <- Prixing.getProduct(barcode)
      } yield (openfoodfacts, prixing)

      future.map {
        case (openfoodfacts, prixing) =>
          val productOpt = Product.mergeSources(openfoodfacts, prixing)
          if (productOpt.isEmpty) {
            Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
          } else {
            Ok(Json.obj("status" -> 200, "data" -> productOpt.get))
          }
      }
    }
  }

  def getPrixing(barcode: String) = Action { request =>
    Async {
      Prixing.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          Ok(Json.obj("status" -> 200, "data" -> productOpt.get))
        }
      }
    }
  }

  def getOpenFoodFacts(barcode: String) = Action { request =>
    Async {
      OpenFoodFacts.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          Ok(Json.obj("status" -> 200, "data" -> productOpt.get))
        }
      }
    }
  }

  def getWithStore(storeId: String, barcode: String) = Action { request =>
    Async {
      val future: Future[(Option[OpenFoodFactsProduct], Option[PrixingProduct])] = for {
        openfoodfacts <- OpenFoodFacts.getProduct(barcode)
        prixing <- Prixing.getProduct(barcode)
      } yield (openfoodfacts, prixing)

      future.map {
        case (openfoodfacts, prixing) =>
          val productOpt = Product.mergeSources(openfoodfacts, prixing)
          if (productOpt.isEmpty) {
            Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
          } else {
            val product = productOpt.get
            val price = if (product.price.isDefined) product.price.get else new Price(new Random().nextDouble() * 3, "€")
            val quantity = if (product.quantity.isDefined) product.quantity.get(0) else new Quantity(new Random().nextDouble() * 1000, "g")
            val json: JsValue = Json.toJson(product)
            val store: JsObject = Json.obj(
              "store" -> Json.obj(
                "id" -> storeId,
                "price" -> price,
                "genericPrice" -> price.forQuantity(quantity).inGeneric(quantity.unit)))

            val addStore = (__).json.update(__.read[JsObject].map { originalData => originalData ++ store })
            val data: JsValue = json.transform(addStore).get
            Ok(Json.obj("status" -> 200, "data" -> data))
          }
      }
    }
  }

  /*def loadProductsFromOpenFoodFacts = Action {
    Async {
      OpenFoodFacts.getDatabase().flatMap { products =>
        val quantities = products.filter(p => p.quantity.isEmpty).map(p => p.more.quantityStr).groupBy(q => q).map { case (value, list) => (value, list.length) }
        val quantitiesByFreq = quantities.groupBy { case (value, freq) => freq.toString }
        val quantitiesFormated = quantitiesByFreq.map(a => (a._1, a._2.map(b => (b._1, Quantity.create(b._1)))))
        val brands = products.map(p => p.brands.mkString.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val brandsByFreq = brands.groupBy { case (value, freq) => freq.toString }
        val categories = products.map(p => p.categories.mkString.toLowerCase()).groupBy(b => b).map { case (value, list) => (value, list.length) }
        val categoriesByFreq = categories.groupBy { case (value, freq) => freq.toString }

        Future.successful(Ok(Json.obj(
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
            "data" -> categoriesByFreq))))

        ProductsDao.drop().flatMap { dropped =>
          val results = products.map { product => ProductsDao.insertOff(product.barcode, Json.toJson(product)) }
          Future.sequence(results).flatMap { errors =>
            ProductsDao.count().map { count =>
              Ok(Json.obj("status" -> 200, "message" -> (count + " products saved !")))
            }
          }
        }
      }
    }
  }*/
}
