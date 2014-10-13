package dao

import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.LastError
import reactivemongo.core.commands.GetLastError

object MalformedEventsDao {
  private val COLLECTION_NAME = "malformedEvents"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj()).cursor[JsValue].toList
  def insert(event: JsValue)(implicit db: DB): Future[LastError] = collection().insert(event)

  def export()(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj()).cursor[JsValue].toList
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = {
    val errors = docs.map { doc =>
      val id = (doc \ "id").asOpt[String].getOrElse(null)
      collection().update(Json.obj("id" -> id), Json.obj("$set" -> doc), GetLastError(), true, false)
    }
    Future.sequence(errors)
  }
  def drop()(implicit db: DB): Future[Boolean] = collection().drop()
}