package models

import scala.concurrent.Future
import play.api.libs.functional.syntax.functionalCanBuildApplicative
import play.api.libs.functional.syntax.toFunctionalBuilderOps
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import play.api.libs.json.JsObject
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.bson.BSONObjectID
import reactivemongo.core.commands.LastError

case class Aliment(
  id: String,
  name: String)

object Aliment {
  val form = Form(
    mapping(
      "id" -> text,
      "name" -> nonEmptyText) {
        (id, name) => if(id.isEmpty()){Aliment(BSONObjectID.generate.stringify, name)}else{Aliment(id, name)}
      } {
        aliment => Some((aliment.id, aliment.name))
      })
}

object AlimentJsonFormat {
  import play.api.libs.json.Json

  implicit val alimentFormat = Json.format[Aliment]
}

object AlimentDao {
  import models.AlimentJsonFormat._
  private val COLLECTION_NAME = "aliments"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def create(aliment: Aliment)(implicit db: DB): Future[LastError] = collection().insert(aliment)

  def find(id: String)(implicit db: DB): Future[Option[Aliment]] = collection().find(Json.obj("id" -> id)).one[Aliment]
  def find(filter: JsObject)(implicit db: DB): Future[Set[Aliment]] = collection().find(filter).cursor[Aliment].collect[Set]()
  def findAll()(implicit db: DB): Future[Set[Aliment]] = collection().find(Json.obj()).cursor[Aliment].collect[Set]()

  def update(id: String, aliment: Aliment)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), Json.obj("$set" -> aliment).transform((__ \ '$set \ 'id).json.prune).get)

  def delete(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))
}
