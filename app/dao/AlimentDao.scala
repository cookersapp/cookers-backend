package dao

import models.Aliment
import models.AlimentFormat._
import models.AlimentCategory
import models.AlimentCategoryFormat._
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.json.JsObject
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._
import reactivemongo.bson._

object AlimentDao {
  // TODO add created & updated fields in aliment and prices (with time & user login)
  private val COLLECTION_NAME = "aliments"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  private def generateId(aliment: Aliment): JsObject = Json.toJson(aliment).as[JsObject].deepMerge(Json.obj("id" -> BSONObjectID.generate.stringify))
  private def toUpdateFormat(aliment: Aliment): JsObject =
    Json.obj("$set" -> aliment).transform(
      (__ \ '$set \ 'id).json.prune andThen
        (__ \ '$set \ 'created).json.prune).get

  def find(id: String)(implicit db: DB): Future[Option[Aliment]] = collection().find(Json.obj("id" -> id)).one[Aliment]
  def find(filter: JsObject)(implicit db: DB): Future[Set[Aliment]] = collection().find(filter).cursor[Aliment].collect[Set]()
  def findAll()(implicit db: DB): Future[Set[Aliment]] = collection().find(Json.obj()).cursor[Aliment].collect[Set]()
  def findAllCategories()(implicit db: DB): Future[Set[AlimentCategory]] =
    db
      .command(RawCommand(BSONDocument("distinct" -> COLLECTION_NAME, "key" -> "category")))
      .map { doc => doc.getAs[Set[AlimentCategory]]("values").get }

  def insert(aliment: Aliment)(implicit db: DB): Future[LastError] = collection().insert(aliment)
  def create(aliment: Aliment)(implicit db: DB): Future[LastError] = collection().insert(generateId(aliment))
  def update(id: String, aliment: Aliment)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), toUpdateFormat(aliment))
  def delete(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))
  def insertAll(aliments: List[Aliment])(implicit db: DB): Future[List[LastError]] = Future.sequence(aliments.map(aliment => collection().insert(aliment)))
  def deleteAll()(implicit db: DB): Future[LastError] = collection().remove(Json.obj())
}
