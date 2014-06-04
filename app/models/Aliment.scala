package models

import org.joda.time.DateTime
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
}

import models.AlimentRarity._

object AlimentRarityJsonFormat {
  implicit val enumReads: Reads[AlimentRarity] = EnumUtils.enumReads(AlimentRarity)
  implicit def enumWrites: Writes[AlimentRarity] = EnumUtils.enumWrites
}

case class AlimentCategory(name: String)

object AlimentCategoryJsonFormat {
  import play.api.libs.json.Json
  implicit val alimentCategoryFormat = Json.format[AlimentCategory]
}

import models.AlimentCategoryJsonFormat._
import models.AlimentRarityJsonFormat._
import models.MetaJsonFormat._

case class Aliment(
  id: String,
  name: String,
  category: AlimentCategory,
  rarity: AlimentRarity,
  created: Meta,
  updated: Meta)

object Aliment {
  val form = Form(
    mapping(
      "id" -> text,
      "name" -> nonEmptyText,
      "category" -> nonEmptyText,
      "rarity" -> nonEmptyText) {
        (id, name, category, rarity) =>
          val alimentId = if (id.isEmpty()) BSONObjectID.generate.stringify else id
          val meta = Meta(new DateTime(), "guest")
          Aliment(alimentId, name, AlimentCategory(category), AlimentRarity.withName(rarity), meta, meta)
      } {
        aliment =>
          Some((
            aliment.id,
            aliment.name,
            aliment.category.name,
            aliment.rarity.toString()))
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
