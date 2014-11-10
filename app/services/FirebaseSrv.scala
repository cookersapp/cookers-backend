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
      response.json.as[Map[String, FirebaseFood]].map { case (id, data) => Food.from(Some(data)) }.toList.flatten
    }
  }

  def fetchFood(id: String): Future[Option[Food]] = {
    WS.url(firebaseUrl + "/foods/" + id + ".json").get().map { response =>
      if (response.json != null) {
        Food.from(response.json.asOpt[FirebaseFood])
      } else {
        None
      }
    }
  }

  def fetchRecipes(): Future[List[Recipe]] = {
    WS.url(firebaseUrl + "/recipes.json").get().flatMap { response =>
      val futures = response.json.as[Map[String, FirebaseRecipe]].map { case (id, data) => Recipe.from(Some(data)) }.toList
      Future.sequence(futures).map(_.flatten)
    }
  }

  def fetchRecipe(id: String): Future[Option[Recipe]] = {
    WS.url(firebaseUrl + "/recipes/" + id + ".json").get().flatMap { response =>
      if (response.json != null) {
        Recipe.from(response.json.asOpt[FirebaseRecipe])
      } else {
        Future.successful(None)
      }
    }
  }

  def fetchSelections(): Future[List[Selection]] = {
    WS.url(firebaseUrl + "/selections.json").get().flatMap { response =>
      val futures = response.json.as[Map[String, FirebaseSelection]].map { case (id, data) => Selection.from(Some(data)) }.toList
      Future.sequence(futures).map(_.flatten)
    }
  }

  def fetchSelection(id: String): Future[Option[Selection]] = {
    WS.url(firebaseUrl + "/selections/" + id + ".json").get().flatMap { response =>
      if (response.json != null) {
        Selection.from(response.json.asOpt[FirebaseSelection])
      } else {
        Future.successful(None)
      }
    }
  }
}