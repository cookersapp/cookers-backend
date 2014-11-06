package controllers

import common.ApiUtils
import services.FirebaseSrv
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import play.api.mvc._

object FirebaseExtract extends Controller {

  def getFoods = Action {
    Async {
      FirebaseSrv.fetchFoods().map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

  def getFood(id: String) = Action {
    Async {
      FirebaseSrv.fetchFood(id).map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

  def getRecipes = Action {
    Async {
      FirebaseSrv.fetchRecipes().map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

  def getRecipe(id: String) = Action {
    Async {
      FirebaseSrv.fetchRecipe(id).map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

  def getSelections = Action {
    Async {
      FirebaseSrv.fetchSelections().map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

  def getSelection(id: String) = Action {
    Async {
      FirebaseSrv.fetchSelection(id).map { res => Ok(ApiUtils.Ok(Json.toJson(res))) }
    }
  }

}
