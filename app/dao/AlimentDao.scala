package dao

import models.Aliment
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.json.JsObject
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands.LastError

object AlimentDao {
  import models.AlimentJsonFormat._
  private val COLLECTION_NAME = "aliments"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  val removeId = (__ \ '$set \ 'id).json.prune
  val removeCreated = (__ \ '$set \ 'created).json.prune

  def create(aliment: Aliment)(implicit db: DB): Future[LastError] = collection().insert(aliment)

  def find(id: String)(implicit db: DB): Future[Option[Aliment]] = collection().find(Json.obj("id" -> id)).one[Aliment]
  def find(filter: JsObject)(implicit db: DB): Future[Set[Aliment]] = collection().find(filter).cursor[Aliment].collect[Set]()
  def findAll()(implicit db: DB): Future[Set[Aliment]] = collection().find(Json.obj()).cursor[Aliment].collect[Set]()

  def update(id: String, aliment: Aliment)(implicit db: DB): Future[LastError] =
    collection().update(
      Json.obj("id" -> id),
      Json.obj("$set" -> aliment).transform(removeId andThen removeCreated).get)

  def delete(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))
}
