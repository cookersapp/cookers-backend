package controllers

import models.food.Product
import models.food.Price
import models.food.Quantity
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import models.StoreProduct
import dao.StoresDao
import dao.ProductsDao
import services.FoodSrv
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

  def getWithStore(storeId: String, barcode: String) = Action { request =>
    Async {
      val future: Future[(Option[Product], Option[StoreProduct])] = for {
        productOpt <- FoodSrv.getProduct(barcode)
        storeProductOpt <- StoresDao.findProduct(storeId, barcode)
      } yield (productOpt, storeProductOpt)

      future.map {
        case (productOpt, storeProductOpt) =>
          if (productOpt.isEmpty) {
            Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
          } else {
            val product = productOpt.get
            val storeProduct = storeProductOpt.getOrElse(StoreProduct.mockFor(product, storeId))

            val addStore = (__).json.update(__.read[JsObject].map { originalData => originalData ++ Json.obj("store" -> storeProduct) })
            val data = Json.toJson(product).transform(addStore).get
            Ok(Json.obj("status" -> 200, "data" -> data))
          }
      }
    }
  }

  def get(barcode: String) = Action { request =>
    Async {
      FoodSrv.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          Ok(Json.obj("status" -> 200, "data" -> productOpt.get))
        }
      }
    }
  }

  def setFoodId(barcode: String, foodId: String) = Action {
    Async {
      ProductsDao.setFoodId(barcode, foodId).map { lastError =>
        lastError.inError match {
          case false => Ok
          case true => InternalServerError(Json.obj("status" -> 500, "message" -> lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  def getCookers(barcode: String) = Action { request =>
    Async {
      FoodSrv.getCookersProduct(barcode).map { productOpt =>
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
      FoodSrv.getOpenFoodFactsProduct(barcode).map { productOpt =>
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
      FoodSrv.getPrixingProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(Json.obj("status" -> 404, "message" -> "Product not found !"))
        } else {
          Ok(Json.obj("status" -> 200, "data" -> productOpt.get))
        }
      }
    }
  }
}
