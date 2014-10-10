package dao

import models.Event
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.LastError

object EventsDao {
  private val COLLECTION_NAME = "events"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[Set[Event]] = collection().find(Json.obj()).sort(Json.obj("time" -> -1)).cursor[Event].collect[Set]()
  def insert(event: Event)(implicit db: DB): Future[LastError] = collection().insert(event)
}