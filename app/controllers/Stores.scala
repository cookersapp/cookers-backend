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

  def get(id: String) = Action {
    Async {
      StoresDao.findById(id).map {
        case Some(store) => Ok(ApiUtils.Ok(store))
        case None => Ok(ApiUtils.NotFound("Store not found !"))
      }
    }
  }

  def getProduct(storeId: String, barcode: String) = Action {
    Async {
      StoresDao.findProduct(storeId, barcode).flatMap { storeProductOpt =>
        if (storeProductOpt.isDefined) {
          Future.successful(Ok(ApiUtils.Ok(storeProductOpt.get)))
        } else {
          ProductSrv.getProduct(barcode).map { productOpt =>
            if (productOpt.isDefined) {
              Ok(ApiUtils.Ok(StoreProduct.mockFor(productOpt.get, storeId)))
            } else {
              Ok(ApiUtils.NotFound("Product not found in Store !"))
            }
          }
        }
      }
    }
  }

  def create = Action(parse.json) { request =>
    Async {
      val name = (request.body \ "name").asOpt[String]
      if (name.isDefined) {
        val store = new Store(name.get)
        StoresDao.insert(store).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(store))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Can't find property 'name' of Store !")))
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
}