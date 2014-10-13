package dao

import models.User
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.LastError
import reactivemongo.core.commands.GetLastError
import reactivemongo.core.commands.Count
import play.modules.reactivemongo.json.BSONFormats
import reactivemongo.bson.BSONDocument
import common.Utils

object UsersDao {
  // examples : https://gist.github.com/almeidap/5685801
  private val removeMongoId = (__ \ '_id).json.prune
  private val COLLECTION_NAME = "users"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[User]] = collection().find(Json.obj()).sort(Json.obj("lastSeen" -> -1)).cursor[User].toList
  def findById(id: String)(implicit db: DB): Future[Option[User]] = collection().find(Json.obj("id" -> id)).one[User]
  def findByEmail(email: String)(implicit db: DB): Future[Option[User]] = collection().find(Json.obj("email" -> email)).one[User]

  def insert(user: User)(implicit db: DB): Future[LastError] = collection().insert(user)
  def updateSetting(id: String, setting: String, settingValue: JsValue)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$set" -> Json.obj("settings." + setting -> settingValue)))
  def addDevice(id: String, device: JsValue)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$addToSet" -> Json.obj("devices" -> device)))
  def lastSeen(id: String)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$set" -> Json.obj("lastSeen" -> new Date().getTime())))

  def createdBefore(time: Long)(implicit db: DB): Future[Int] = {
    val query: JsObject = Json.obj("created" -> Json.obj("$lt" -> time))
    val bsonQuery: BSONDocument = BSONFormats.toBSON(query).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }

  def export()(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj()).cursor[JsValue].toList.map(elts => elts.map(elt => elt.transform(removeMongoId).get))
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = {
    if (Utils.isProd()) {
      Future.failed(new Exception("Can't do this in production !"))
    } else {
      val errors = docs.map { doc =>
        val id = (doc \ "id").asOpt[String].getOrElse(null)
        collection().update(Json.obj("id" -> id), Json.obj("$set" -> doc), GetLastError(), true, false)
      }
      Future.sequence(errors)
    }
  }
  def drop()(implicit db: DB): Future[Boolean] = {
    if (Utils.isProd()) {
      Future.failed(new Exception("Can't do this in production !"))
    } else {
      collection().drop().recover { case err => false }
    }
  }
}