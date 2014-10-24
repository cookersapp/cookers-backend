package models

import play.api.libs.json._
import play.api.libs.functional.syntax.functionalCanBuildApplicative
import play.api.libs.functional.syntax.toFunctionalBuilderOps

case class Price(
  value: Double,
  currency: String) {
  def forQuantity(q: Quantity): PriceQuantity = new PriceQuantity(value / q.value, currency, q.unit)
}
object Price {
  implicit val priceFormat = Json.format[Price]
}

case class PriceQuantity(
  value: Double,
  currency: String,
  unit: String) {
  def in(toUnit: String): PriceQuantity = new PriceQuantity(value * Quantity.convert(unit, toUnit), currency, toUnit)
  def inGeneric(toUnit: String): PriceQuantity = new PriceQuantity(value * Quantity.convert(unit, Quantity.getGeneric(toUnit)), currency, Quantity.getGeneric(toUnit))
  def forQuantity(q: Quantity): Price = new Price(value * Quantity.convert(unit, q.unit) * q.value, currency)
}
object PriceQuantity {
  implicit val priceQuantityFormat = Json.format[PriceQuantity]
}
