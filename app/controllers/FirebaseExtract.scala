package controllers

import common.ApiUtils
import models.food.Food
import models.food.Recipe
import models.food.Selection
import models.food.dataImport.FirebaseFood
import models.food.dataImport.FirebaseRecipe
import models.food.dataImport.FirebaseSelection
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import play.api.mvc._

object FirebaseExtract extends Controller {
  val firebaseUrl = "https://crackling-fire-7710.firebaseio.com"

  def getFoods = Action {
    Async {
      WS.url(firebaseUrl + "/foods.json").get().map { response =>
        response.json.as[Map[String, FirebaseFood]].map { case (id, food) => Food.from(food) }.toList
      }.map { foods =>
        Ok(ApiUtils.Ok(Json.toJson(foods)))
      }
    }
  }

  def getFood(id: String) = Action {
    Async {
      WS.url(firebaseUrl + "/foods/" + id + ".json").get().map { response =>
        Food.from(response.json.as[FirebaseFood])
      }.map { food =>
        Ok(ApiUtils.Ok(Json.toJson(food)))
      }
    }
  }

  def getRecipes = Action {
    Async {
      WS.url(firebaseUrl + "/recipes.json").get().map { response =>
        response.json.as[Map[String, FirebaseRecipe]].map { case (id, recipe) => Recipe.from(recipe) }.toList
      }.map { recipes =>
        Ok(ApiUtils.Ok(Json.toJson(recipes)))
      }
    }
  }

  def getRecipe(id: String) = Action {
    Async {
      WS.url(firebaseUrl + "/recipes/" + id + ".json").get().map { response =>
        Recipe.from(response.json.as[FirebaseRecipe])
      }.map { recipe =>
        Ok(ApiUtils.Ok(Json.toJson(recipe)))
      }
    }
  }

  def getSelections = Action {
    Async {
      WS.url(firebaseUrl + "/selections.json").get().map { response =>
        response.json.as[Map[String, FirebaseSelection]].map { case (id, selection) => Selection.from(selection) }.toList
      }.map { selections =>
        Ok(ApiUtils.Ok(Json.toJson(selections)))
      }
    }
  }

  def getSelection(id: String) = Action {
    Async {
      WS.url(firebaseUrl + "/selections/" + id + ".json").get().map { response =>
        Selection.from(response.json.as[FirebaseSelection])
      }.map { selection =>
        Ok(ApiUtils.Ok(Json.toJson(selection)))
      }
    }
  }
}
