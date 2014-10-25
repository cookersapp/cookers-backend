package models.food

import play.api.libs.json._

case class Rating(
  value: Double,
  max: Double) {
}
object Rating {
  implicit val ratingFormat = Json.format[Rating]
}
