package models.food.dataImport

import play.api.libs.json._

case class CookersProduct(
  barcode: String,
  foodId: String,
  scans: Int,
  scannedWith: Option[Map[String, Int]])
object CookersProduct {
  val defaultFoodId = "unknown"
  implicit val cookersProductFormat = Json.format[CookersProduct]

  def create(barcode: String): CookersProduct = new CookersProduct(barcode, defaultFoodId, 0, None)
}
