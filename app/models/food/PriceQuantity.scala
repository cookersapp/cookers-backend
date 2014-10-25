package models.food

import play.api.libs.json._

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
