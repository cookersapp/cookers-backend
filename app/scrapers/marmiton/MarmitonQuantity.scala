package scrapers.marmiton

import common.RegexMatcher
import play.api.libs.json._

case class MarmitonQuantity(
  value: Double,
  unit: String)
object MarmitonQuantity {
  implicit val marmitonQuantityFormat = Json.format[MarmitonQuantity]

  def forTime(time: String): Option[MarmitonQuantity] = {
    val res1 = RegexMatcher.simple(time, "PT([0-9]+)M")(0).map(str => MarmitonQuantity(str.toInt, "minutes"))
    val tmp2 = RegexMatcher.simple(time, "(?:([0-9]+) h )?([0-9]+) min")
    val res2 = tmp2(1).map(str => MarmitonQuantity(tmp2(0).getOrElse("0").toInt * 60 + str.toInt, "minutes"))

    if (res1.isDefined) res1
    else if (res2.isDefined) res2
    else None
  }
  def forServings(servings: String): Option[MarmitonQuantity] = {
    val res = RegexMatcher.simple(servings, "Ingrédients \\(pour ([0-9]+) ([^)]+)\\) :")
    res(0).map(value => MarmitonQuantity(value.toInt, res(1).getOrElse("")))
  }
}
