package controllers

import common.ApiUtils
import models.food.Product
import models.food.Price
import models.food.Quantity
import models.StoreProduct
import dao.StoresDao
import dao.ProductsDao
import services.AdditiveSrv
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
      AdditiveSrv.getAllAdditives().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def getAllAdditifAlimentaires = Action {
    Async {
      AdditiveSrv.getAllAdditifAlimentairesAdditive().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def getAllPrixing = Action {
    Async {
      AdditiveSrv.getAllPrixingAdditives().map { additives => Ok(ApiUtils.Ok(Json.toJson(additives))) }
    }
  }

  def get(reference: String) = Action {
    Async {
      AdditiveSrv.getAdditive(reference.toLowerCase()).map { additiveOpt =>
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
      AdditiveSrv.getAdditifAlimentairesAdditive(reference.toLowerCase()).map { additiveOpt =>
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
      AdditiveSrv.getPrixingAdditive(reference.toLowerCase()).map { additiveOpt =>
        if (additiveOpt.isEmpty) {
          Ok(ApiUtils.NotFound("Additive not found !"))
        } else {
          Ok(ApiUtils.Ok(additiveOpt.get))
        }
      }
    }
  }
}
