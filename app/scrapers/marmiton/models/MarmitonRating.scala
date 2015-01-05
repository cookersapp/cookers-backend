package scrapers.marmiton.models

import play.api.libs.json._
import org.jsoup._

case class MarmitonRating(
  average: Int,
  best: Int,
  worst: Int,
  count: Int)
object MarmitonRating {
  implicit val marmitonRatingFormat = Json.format[MarmitonRating]

  def create(content: String): Option[MarmitonRating] = {
    val page = Jsoup.parse(content)
    val average = toInt(page.select(".average .value-title").attr("title"), 0)
    val best = toInt(page.select(".best .value-title").attr("title"), 0)
    val worst = toInt(page.select(".worst .value-title").attr("title"), 0)
    val count = toInt(page.select(".count .value-title").attr("title"), 0)
    if (count > 0)
      Some(MarmitonRating(average, best, worst, count))
    else
      None
  }

  private def toInt(str: String, default: Int): Int = {
    try {
      str.toInt
    } catch {
      case e: Exception => default
    }
  }
}
