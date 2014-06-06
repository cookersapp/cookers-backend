package dao

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

object AlimentCategoryDao {
  private val COLLECTION_NAME = "aliment-categories"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  private def generateId(category: AlimentCategory): JsObject = Json.toJson(category).as[JsObject].deepMerge(Json.obj("id" -> BSONObjectID.generate.stringify))
  private def toUpdateFormat(category: AlimentCategory): JsObject =
    Json.obj("$set" -> category).transform(
      (__ \ '$set \ 'id).json.prune andThen
        (__ \ '$set \ 'created).json.prune).get

  def find(id: String)(implicit db: DB): Future[Option[AlimentCategory]] = collection().find(Json.obj("id" -> id)).one[AlimentCategory]
  def find(filter: JsObject)(implicit db: DB): Future[Set[AlimentCategory]] = collection().find(filter).cursor[AlimentCategory].collect[Set]()
  def findAll()(implicit db: DB): Future[Set[AlimentCategory]] = collection().find(Json.obj()).cursor[AlimentCategory].collect[Set]()

  def insert(category: AlimentCategory)(implicit db: DB): Future[LastError] = collection().insert(category)
  def create(category: AlimentCategory)(implicit db: DB): Future[LastError] = collection().insert(generateId(category))
  def update(id: String, category: AlimentCategory)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), toUpdateFormat(category))
  def delete(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))
  def insertAll(categories: List[AlimentCategory])(implicit db: DB): Future[List[LastError]] = Future.sequence(categories.map(category => collection().insert(category)))
  def deleteAll()(implicit db: DB): Future[LastError] = collection().remove(Json.obj())
}
