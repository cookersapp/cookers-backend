package services

import models.food.Food
import models.food.Recipe
import models.food.Selection
import models.food.dataImport.FirebaseFood
import models.food.dataImport.FirebaseRecipe
import models.food.dataImport.FirebaseSelection
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws._

object FirebaseSrv {
  val firebaseUrl = "https://crackling-fire-7710.firebaseio.com"

  def fetchFoods(): Future[List[Food]] = {
    WS.url(firebaseUrl + "/foods.json").get().map { response =>
      response.json.as[Map[String, FirebaseFood]].map { case (id, data) => Food.from(data) }.toList
    }
  }

  def fetchFood(id: String): Future[Food] = {
    WS.url(firebaseUrl + "/foods/" + id + ".json").get().map { response =>
      Food.from(response.json.as[FirebaseFood])
    }
  }

  def fetchRecipes(): Future[List[Recipe]] = {
    WS.url(firebaseUrl + "/recipes.json").get().flatMap { response =>
      val futures = response.json.as[Map[String, FirebaseRecipe]].map { case (id, data) => Recipe.from(data) }.toList
      Future.sequence(futures)
    }
  }

  def fetchRecipe(id: String): Future[Recipe] = {
    WS.url(firebaseUrl + "/recipes/" + id + ".json").get().flatMap { response =>
      Recipe.from(response.json.as[FirebaseRecipe])
    }
  }

  def fetchSelections(): Future[List[Selection]] = {
    WS.url(firebaseUrl + "/selections.json").get().flatMap { response =>
      val futures = response.json.as[Map[String, FirebaseSelection]].map { case (id, data) => Selection.from(data) }.toList
      Future.sequence(futures)
    }
  }

  def fetchSelection(id: String): Future[Selection] = {
    WS.url(firebaseUrl + "/selections/" + id + ".json").get().flatMap { response =>
      Selection.from(response.json.as[FirebaseSelection])
    }
  }
}