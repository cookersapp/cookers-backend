package dao

import models.Event
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.Logger
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.Count
import reactivemongo.core.commands.LastError
import reactivemongo.core.commands.RawCommand
import reactivemongo.bson.BSONDocument
import reactivemongo.core.commands.GetLastError

object EventsDao {
  private val COLLECTION_NAME = "events"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[Event]] = collection().find(Json.obj()).sort(Json.obj("time" -> -1)).cursor[Event].toList
  def findByName(name: String)(implicit db: DB): Future[List[Event]] = collection().find(Json.obj("name" -> name)).sort(Json.obj("time" -> -1)).cursor[Event].toList
  def insert(event: Event)(implicit db: DB): Future[LastError] = collection().insert(event)

  def getActiveUsers(from: Long, to: Long)(implicit db: DB): Future[List[String]] = {
    val selector = Json.obj("$and" -> Json.arr(
      Json.obj("time" -> Json.obj("$gt" -> from)),
      Json.obj("time" -> Json.obj("$lt" -> to))))
    val query: JsObject = Json.obj("distinct" -> COLLECTION_NAME, "key" -> "user", "query" -> selector)
    val bsonQuery: BSONDocument = BSONFormats.toBSON(query).get.asInstanceOf[BSONDocument]
    val result = collection().db.command(RawCommand(bsonQuery)).map(res => BSONFormats.toJSON(res))
    result.map { json => (json \ "values").as[List[String]] }
  }
  def fired(name: String, from: Long, to: Long)(implicit db: DB): Future[Int] = {
    val selector = Json.obj("$and" -> Json.arr(
      Json.obj("name" -> name),
      Json.obj("time" -> Json.obj("$gt" -> from)),
      Json.obj("time" -> Json.obj("$lt" -> to))))
    val bsonQuery: BSONDocument = BSONFormats.toBSON(selector).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def fired(from: Long, to: Long)(implicit db: DB): Future[Int] = {
    val selector = Json.obj("$and" -> Json.arr(
      Json.obj("time" -> Json.obj("$gt" -> from)),
      Json.obj("time" -> Json.obj("$lt" -> to))))
    val bsonQuery: BSONDocument = BSONFormats.toBSON(selector).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }

  def export()(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj()).cursor[JsValue].toList
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = {
    val errors = docs.map { doc =>
      val removeMongoId = (__ \ '_id).json.prune
      val mongoDoc = doc.transform(removeMongoId).get
      val id = (mongoDoc \ "id").asOpt[String].getOrElse(null)
      collection().update(Json.obj("id" -> id), Json.obj("$set" -> mongoDoc), GetLastError(), true, false)
    }
    Future.sequence(errors)
  }
  def drop()(implicit db: DB): Future[Boolean] = collection().drop().recover { case err => false }
}