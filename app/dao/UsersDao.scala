package dao

import common.Utils
import models.User
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import reactivemongo.api.DB
import reactivemongo.core.commands._
import reactivemongo.bson.BSONDocument
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection

object UsersDao {
  private val COLLECTION_NAME = "users"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[User]] = collection().find(Json.obj()).sort(Json.obj("lastSeen" -> -1)).cursor[User].toList
  def findById(id: String)(implicit db: DB): Future[Option[User]] = collection().find(Json.obj("id" -> id)).one[User]
  def findByEmail(email: String)(implicit db: DB): Future[Option[User]] = collection().find(Json.obj("email" -> email)).one[User]

  def insert(user: User)(implicit db: DB): Future[LastError] = collection().insert(user)
  def updateSetting(id: String, setting: String, settingValue: JsValue)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$set" -> Json.obj("settings." + setting -> settingValue)))
  def messageClosed(id: String, message: String)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$addToSet" -> Json.obj("closedMessages" -> message)))
  def addDevice(id: String, device: JsValue)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$addToSet" -> Json.obj("devices" -> device)))
  def userSeen(id: String, appVersion: String)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$set" -> Json.obj("lastSeen" -> new Date().getTime(), "appVersion" -> appVersion)))

  def createdBefore(time: Long)(implicit db: DB): Future[Int] = {
    val query: JsObject = Json.obj("created" -> Json.obj("$lt" -> time))
    val bsonQuery: BSONDocument = BSONFormats.toBSON(query).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def getUsersCreationDate()(implicit db: DB): Future[List[(String, Long)]] = {
    collection()
      .find(Json.obj(), Json.obj("_id" -> false, "id" -> true, "created" -> true))
      .sort(Json.obj("created" -> 1)).cursor[JsValue].toList
      .map { list =>
        list.map { res =>
          ((res \ "id").as[String], (res \ "created").as[Long])
        }
      }
  }

  def export()(implicit db: DB): Future[List[JsValue]] = DaoUtils.export(db, collection())
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = DaoUtils.importCollection(db, collection(), docs)
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())
}