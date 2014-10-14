package dao

import common.Utils
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._

object DaoUtils {
  // examples : https://gist.github.com/almeidap/5685801
  private val removeMongoId = (__ \ '_id).json.prune
  private val removeFormatedField = (__ \ 'data \ 'error \ 'ingredient \ 'sources \ 'recipe \ '$formated).json.prune
  private def removeUnwantedFields(json: JsValue): JsValue = json.transform(removeMongoId /*andThen removeFormatedField*/).getOrElse(Json.obj())

  def export(db: DB, collection: JSONCollection): Future[List[JsValue]] = collection.find(Json.obj()).cursor[JsValue].toList.map(elts => elts.map(elt => removeUnwantedFields(elt)))
  def importCollection(db: DB, collection: JSONCollection, docs: List[JsValue]): Future[List[LastError]] = {
    if (Utils.isProd()) {
      Future.failed(new Exception("Can't do this in production !"))
    } else {
      val errors = docs.map { doc =>
        val id = (doc \ "id").asOpt[String].getOrElse(null)
        collection.update(Json.obj("id" -> id), Json.obj("$set" -> doc), GetLastError(), true, false)
      }
      Future.sequence(errors)
    }
  }
  def drop(db: DB, collection: JSONCollection): Future[Boolean] = {
    if (Utils.isProd()) {
      Future.failed(new Exception("Can't do this in production !"))
    } else {
      collection.drop().recover { case err => false }
    }
  }
}