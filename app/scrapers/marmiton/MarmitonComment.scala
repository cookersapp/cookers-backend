package scrapers.marmiton

import common.RegexMatcher
import play.api.libs.json._
import org.jsoup.nodes._

case class MarmitonComment(
  user: String,
  rating: Int,
  ratingMax: Int,
  content: String,
  date: String)
object MarmitonComment {
  implicit val marmitonCommentFormat = Json.format[MarmitonComment]

  def create(elt: Element): Option[MarmitonComment] = {
    val user = elt.select(".m_commentaire_content span").text()
    val ratings = RegexMatcher.simple(elt.select(".m_commentaire_note span").text(), "([0-9]+)/([0-9]+)")
    val rating = ratings(0).getOrElse("0").toInt
    val ratingMax = ratings(1).getOrElse("0").toInt
    val content = elt.select(".m_commentaire_content p").text()
    val date = RegexMatcher.simple(elt.select(".m_commentaire_content .m_commentaire_info").text(), "([0-9]+/[0-9]+/[0-9]+)")(0).getOrElse("")
    Some(MarmitonComment(user, rating, ratingMax, content, date))
  }
}
