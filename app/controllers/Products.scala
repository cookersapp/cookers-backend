package controllers

import common.ApiUtils
import models.food.Product
import models.food.Price
import models.food.Quantity
import models.StoreProduct
import dao.StoresDao
import dao.ProductsDao
import services.ProductSrv
import scala.util.Random
import scala.concurrent.Future
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object Products extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      ProductSrv.getAllProducts().map { products => Ok(ApiUtils.Ok(Json.toJson(products))) }
    }
  }

  def getAllCookers = Action {
    Async {
      ProductSrv.getAllCookersProducts().map { products => Ok(ApiUtils.Ok(Json.toJson(products))) }
    }
  }

  def getAllOpenFoodFacts = Action {
    Async {
      ProductSrv.getAllOpenFoodFactsProducts().map { products => Ok(ApiUtils.Ok(Json.toJson(products))) }
    }
  }

  def getAllPrixing = Action {
    Async {
      ProductSrv.getAllPrixingProducts().map { products => Ok(ApiUtils.Ok(Json.toJson(products))) }
    }
  }

  def get(barcode: String) = Action {
    Async {
      ProductSrv.getProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Product not found !"))
        } else {
          Ok(ApiUtils.Ok(productOpt.get))
        }
      }
    }
  }

  def setFoodId(barcode: String, foodId: String) = Action {
    Async {
      ProductsDao.setFoodId(barcode, foodId).map { lastError =>
        lastError.inError match {
          case false => {
            StoresDao.setProductFoodId(barcode, foodId)
            Ok(ApiUtils.Ok)
          }
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  def getCookers(barcode: String) = Action {
    Async {
      ProductSrv.getCookersProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Product not found !"))
        } else {
          Ok(ApiUtils.Ok(productOpt.get))
        }
      }
    }
  }

  def getOpenFoodFacts(barcode: String) = Action {
    Async {
      ProductSrv.getOpenFoodFactsProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Product not found !"))
        } else {
          Ok(ApiUtils.Ok(productOpt.get))
        }
      }
    }
  }

  def getPrixing(barcode: String) = Action {
    Async {
      ProductSrv.getPrixingProduct(barcode).map { productOpt =>
        if (productOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Product not found !"))
        } else {
          Ok(ApiUtils.Ok(productOpt.get))
        }
      }
    }
  }
}
