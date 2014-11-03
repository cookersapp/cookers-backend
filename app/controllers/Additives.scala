package controllers

import common.ApiUtils
import models.food.Product
import models.food.Price
import models.food.Quantity
import models.StoreProduct
import dao.StoresDao
import dao.ProductsDao
import services.FoodSrv
import scala.util.Random
import scala.concurrent.Future
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object Additives extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      FoodSrv.getAllAdditives().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def getAllAdditifAlimentaires = Action {
    Async {
      FoodSrv.getAllAdditifAlimentairesAdditive().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def getAllPrixing = Action {
    Async {
      FoodSrv.getAllPrixingAdditives().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def get(reference: String) = Action {
    Async {
      FoodSrv.getAdditive(reference.toLowerCase()).map { additiveOpt =>
        if (additiveOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Additive not found !"))
        } else {
          Ok(ApiUtils.Ok(additiveOpt.get))
        }
      }
    }
  }

  def getAdditifAlimentaires(reference: String) = Action {
    Async {
      FoodSrv.getAdditifAlimentairesAdditive(reference.toLowerCase()).map { additiveOpt =>
        if (additiveOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Additive not found !"))
        } else {
          Ok(ApiUtils.Ok(additiveOpt.get))
        }
      }
    }
  }

  def getPrixing(reference: String) = Action {
    Async {
      FoodSrv.getPrixingAdditive(reference.toLowerCase()).map { additiveOpt =>
        if (additiveOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Additive not found !"))
        } else {
          Ok(ApiUtils.Ok(additiveOpt.get))
        }
      }
    }
  }
}
