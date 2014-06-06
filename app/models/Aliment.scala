package models

import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import reactivemongo.bson._

case class Aliment(
  id: String,
  name: String,
  category: AlimentCategory,
  rarity: String,
  prices: List[Price])

object Aliment {
  val mapForm = mapping(
    "id" -> text,
    "name" -> nonEmptyText,
    "category" -> AlimentCategory.mapForm,
    "rarity" -> nonEmptyText,
    "prices" -> list(Price.mapForm))(Aliment.apply)(Aliment.unapply)
}

import models.AlimentCategoryFormat._
import models.PriceFormat._

object AlimentFormat {
  import play.api.libs.json.Json
  implicit val alimentFormat = Json.format[Aliment]
}

