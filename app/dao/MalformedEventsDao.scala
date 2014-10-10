package dao

import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.LastError

object MalformedEventsDao {
  private val COLLECTION_NAME = "malformedEvents"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj()).cursor[JsValue].toList
  def insert(event: JsValue)(implicit db: DB): Future[LastError] = collection().insert(event)
}