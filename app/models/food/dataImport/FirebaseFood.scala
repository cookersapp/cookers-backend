package models.food.dataImport

import play.api.libs.json._

case class FirebaseFoodPrice(
  value: Double,
  currency: String,
  unit: String,
  source: Option[String],
  created: Option[Long])
object FirebaseFoodPrice {
  implicit val firebaseFoodPriceFormat = Json.format[FirebaseFoodPrice]
}

case class FirebaseFood(
  id: String,
  name: String,
  slug: Option[String],
  category: String,
  prices: Option[List[FirebaseFoodPrice]],
  created: Long,
  updated: Option[Long])
object FirebaseFood {
  implicit val firebaseFoodFormat = Json.format[FirebaseFood]
}
