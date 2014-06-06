package models

import utils.EnumUtils
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import reactivemongo.bson._

/*
 * Aliment {
 * 	id: '538ef1434b0600340a0c7d42',
 *  name: 'pomme',
 *  rarity: 'common', // basic, common, rare
 *  category: {
 *   	name: 'fruit'
 *  },
 *  prices: [
 *  	{amount: 1.95, currency: 'euro', unit: 'kg', date: 1401880864, source: 'http://...'}
 *  ],
 *  created: {date: 1401880864, by: 'toto'},
 *  updated: {date: 1401880864, by: 'toto'}
 * }
 */

case class AlimentCategory(name: String)

object AlimentCategory {
  val mapForm = mapping("name" -> nonEmptyText)(AlimentCategory.apply)(AlimentCategory.unapply)
}

case class Aliment(
  id: String,
  name: String,
  category: AlimentCategory,
  rarity: String,
  prices: List[Int])

object Aliment {
  val mapForm = mapping(
    "id" -> text,
    "name" -> nonEmptyText,
    "category" -> AlimentCategory.mapForm,
    "rarity" -> nonEmptyText,
    "prices" -> list(number))(Aliment.apply)(Aliment.unapply)
}

object AlimentCategoryFormat {
  import play.api.libs.json.Json
  implicit val alimentCategoryFormat = Json.format[AlimentCategory]
  implicit object AlimentCategoryReader extends BSONDocumentReader[AlimentCategory] {
    def read(doc: BSONDocument): AlimentCategory = AlimentCategory(doc.getAs[String]("name").get)
  }
}

import models.AlimentCategoryFormat._

object AlimentFormat {
  import play.api.libs.json.Json
  implicit val alimentFormat = Json.format[Aliment]
}

