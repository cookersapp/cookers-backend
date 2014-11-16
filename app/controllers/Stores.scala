package controllers

import common.ApiUtils
import models.Store
import models.StoreProduct
import dao.StoresDao
import services.ProductSrv
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController

object Stores extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      StoresDao.all().map { stores => Ok(ApiUtils.Ok(Json.toJson(stores))) }
    }
  }

  def create = Action(parse.json) { request =>
    Async {
      val store = Store.from(request.body)
      if (store.isDefined) {
        StoresDao.insert(store.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(store.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed Store object !")))
      }
    }
  }

  def get(id: String) = Action {
    Async {
      StoresDao.find(id).map {
        case Some(store) => Ok(ApiUtils.Ok(store))
        case None => Ok(ApiUtils.NotFound("Store not found !"))
      }
    }
  }

  def update(id: String) = Action(parse.json) { request =>
    Async {
      val store = request.body.asOpt[Store]
      if (store.isDefined) {
        StoresDao.update(id, store.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(store.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed Store object !")))
      }
    }
  }

  def remove(id: String) = Action {
    Async {
      StoresDao.remove(id).map { lastError =>
        lastError.inError match {
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  def getAllProducts(store: String) = Action {
    Async {
      StoresDao.allProducts(store).map { storeProducts => Ok(ApiUtils.Ok(Json.toJson(storeProducts))) }
    }
  }

  def createProduct(store: String) = Action(parse.json) { request =>
    Async {
      val storeProduct = StoreProduct.from(request.body)
      if (storeProduct.isDefined) {
        StoresDao.insertProduct(storeProduct.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(storeProduct.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed StoreProduct object !")))
      }
    }
  }

  def getProduct(store: String, productId: String) = Action {
    Async {
      StoresDao.findProduct(store, productId).flatMap { storeProductOpt =>
        if (storeProductOpt.isDefined) {
          Future.successful(Ok(ApiUtils.Ok(storeProductOpt.get)))
        } else {
          ProductSrv.getProduct(productId).map { productOpt =>
            if (productOpt.isDefined) {
              Ok(ApiUtils.Ok(StoreProduct.mockFor(productOpt.get, store)))
            } else {
              Ok(ApiUtils.NotFound("Product not found in Store !"))
            }
          }
        }
      }
    }
  }

  def updateProduct(store: String, productId: String) = Action(parse.json) { request =>
    Async {
      val storeProduct = request.body.asOpt[StoreProduct]
      if (storeProduct.isDefined) {
        StoresDao.updateProduct(store, productId, storeProduct.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(storeProduct.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed StoreProduct object !")))
      }
    }
  }

  def removeProduct(store: String, productId: String) = Action {
    Async {
      StoresDao.removeProduct(store, productId).map { lastError =>
        lastError.inError match {
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }
}