package models.food.dataImport

import play.api.libs.json._

case class CookersProduct(
  barcode: String,
  foodId: String)
object CookersProduct {
  implicit val cookersProductFormat = Json.format[CookersProduct]

  def create(barcode: String): CookersProduct = new CookersProduct(barcode, "unknown")
}
