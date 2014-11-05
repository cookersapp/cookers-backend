package dao

import models.GlobalMessage
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import reactivemongo.api.DB
import reactivemongo.core.commands._
import reactivemongo.bson.BSONDocument
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection

object GlobalMessagesDao {
  private val COLLECTION_NAME = "globalmessages"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[GlobalMessage]] = collection().find(Json.obj()).cursor[GlobalMessage].toList
  def findById(id: String)(implicit db: DB): Future[Option[GlobalMessage]] = collection().find(Json.obj("id" -> id)).one[GlobalMessage]
  def findFor(version: String)(implicit db: DB): Future[List[GlobalMessage]] = collection().find(Json.obj("versions" -> version)).cursor[GlobalMessage].toList

  def insert(message: GlobalMessage)(implicit db: DB): Future[LastError] = collection().insert(message)
  def update(id: String, message: GlobalMessage)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), message)
  def remove(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))

  def export()(implicit db: DB): Future[List[JsValue]] = DaoUtils.export(db, collection())
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = DaoUtils.importCollection(db, collection(), docs)
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())
}