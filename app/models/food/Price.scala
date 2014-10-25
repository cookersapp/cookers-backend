package models.food

import play.api.libs.json._

case class Price(
  value: Double,
  currency: String) {
  def forQuantity(q: Quantity): PriceQuantity = new PriceQuantity(value / q.value, currency, q.unit)
}
object Price {
  implicit val priceFormat = Json.format[Price]
}
