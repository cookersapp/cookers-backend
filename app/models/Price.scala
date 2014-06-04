package models

import utils.EnumUtils
import play.api.libs.json.Reads
import play.api.libs.json.Writes

object Currency extends Enumeration {
  type Currency = Value
  val euro, dollar = Value
  def strValues = Currency.values.toList.map(_.toString())
}

object Unit extends Enumeration {
  type Unit = Value
  val unit, kg, g, litre, cl = Value
  def strValues = Unit.values.toList.map(_.toString())
}

import models.Currency._
import models.Unit._

object CurrencyFormat {
  implicit val enumReads: Reads[Currency] = EnumUtils.enumReads(Currency)
  implicit def enumWrites: Writes[Currency] = EnumUtils.enumWrites
}

object UnitFormat {
  implicit val enumReads: Reads[Unit] = EnumUtils.enumReads(Unit)
  implicit def enumWrites: Writes[Unit] = EnumUtils.enumWrites
}

case class Price(
    amount: Float,
    currency: Currency,
    unit: Unit,
    source: String,
    created: Meta)

object PriceFormat {
  import play.api.libs.json.Json
  implicit val alimentCategoryFormat = Json.format[AlimentCategory]
}