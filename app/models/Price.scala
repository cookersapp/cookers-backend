package models

import scala.BigDecimal
import play.api.libs.json.Reads
import play.api.libs.json.Writes
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._

case class Price(
  amount: BigDecimal,
  currency: String,
  unit: String,
  source: String)

object Price {
  val mapForm = mapping(
    "amount" -> bigDecimal,
    "currency" -> nonEmptyText,
    "unit" -> nonEmptyText,
    "source" -> nonEmptyText)(Price.apply)(Price.unapply)
}

object PriceFormat {
  import play.api.libs.json.Json
  implicit val priceFormat = Json.format[Price]
}
