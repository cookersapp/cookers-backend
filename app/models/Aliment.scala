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
import utils.EnumUtils

/*
 * Aliment {
 * 	id: '538ef1434b0600340a0c7d42',
 *  name: 'pomme',
 *  rarity: 'common', // basic, common, rare
 *  category: {
 *  	id: '538ef1434b0600340a0c7d42',
 *   	name: 'fruit'
 *  },
 *  prices: [
 *  	{amount: 1.95, currency: 'euro', unit: 'kg', date: 1401880864, source: 'http://...'}
 *  ],
 *  created: {date: 1401880864, by: 'toto'},
 *  updated: {date: 1401880864, by: 'toto'}
 * }
 */

object AlimentRarity extends Enumeration {
  type AlimentRarity = Value
  val basic, common, rare = Value
  def strValues = AlimentRarity.values.toList.map(_.toString())

  implicit val enumReads: Reads[AlimentRarity] = EnumUtils.enumReads(AlimentRarity)
  implicit def enumWrites: Writes[AlimentRarity] = EnumUtils.enumWrites
}

import models.AlimentRarity._

case class Aliment(
  id: String,
  name: String,
  rarity: AlimentRarity)

object Aliment {
  val form = Form(
    mapping(
      "id" -> text,
      "name" -> nonEmptyText,
      "rarity" -> nonEmptyText) {
        (id, name, rarity) =>
          val alimentId = if (id.isEmpty()) BSONObjectID.generate.stringify else id
          Aliment(alimentId, name, AlimentRarity.withName(rarity))
      } {
        aliment => Some((aliment.id, aliment.name, aliment.rarity.toString()))
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
