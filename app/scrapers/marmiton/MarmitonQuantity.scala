package scrapers.marmiton

import common.RegexMatcher
import play.api.libs.json._

case class MarmitonQuantity(
  value: Double,
  unit: String)
object MarmitonQuantity {
  implicit val marmitonQuantityFormat = Json.format[MarmitonQuantity]

  def forTime(time: String): Option[MarmitonQuantity] = {
    RegexMatcher.simple(time, "PT([0-9]+)M")(0).map(str => MarmitonQuantity(str.toInt, "minutes"))
  }
  def forServings(servings: String): Option[MarmitonQuantity] = {
    val res = RegexMatcher.simple(servings, "Ingrédients \\(pour ([0-9]+) ([^)]+)\\) :")
    res(0).map(value => MarmitonQuantity(value.toInt, res(1).getOrElse("")))
  }
}
