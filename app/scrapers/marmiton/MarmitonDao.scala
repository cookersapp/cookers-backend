package scrapers.marmiton

import scrapers.marmiton.models.MarmitonRecipe
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.Logger
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._

object MarmitonDao {
  private val COLLECTION_NAME = "marmitonRecipes"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  //def all()(implicit db: DB): Future[List[MarmitonRecipe]] = collection().find(Json.obj()).cursor[JsValue].toList.map(_.map(json => json.asOpt[MarmitonRecipe]).flatten)
  //def insert(recipe: MarmitonRecipe)(implicit db: DB): Future[LastError] = collection().insert(recipe)
  def upsert(recipe: MarmitonRecipe)(implicit db: DB): Future[LastError] = collection().update(Json.obj("url" -> recipe.url), recipe, upsert = true)
  //def update(recipe: MarmitonRecipe)(implicit db: DB): Future[LastError] = collection().update(Json.obj("url" -> recipe.url), recipe)
  //def findById(url: String)(implicit db: DB): Future[Option[MarmitonRecipe]] = collection().find(Json.obj("url" -> url)).one[JsValue].map(_.flatMap(_.asOpt[MarmitonRecipe]))
  def findByUrl(url: String)(implicit db: DB): Future[Option[MarmitonRecipe]] = collection().find(Json.obj("url" -> url)).one[JsValue].map(_.flatMap(_.asOpt[MarmitonRecipe])).recover {
    case e: Throwable => Logger.error("catched " + e.getClass().getName() + ": " + e.getMessage()); None
  }
  //def remove(url: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("url" -> url))
}
