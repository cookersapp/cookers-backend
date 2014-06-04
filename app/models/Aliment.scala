package models

import org.joda.time.DateTime
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import reactivemongo.bson.BSONObjectID
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

