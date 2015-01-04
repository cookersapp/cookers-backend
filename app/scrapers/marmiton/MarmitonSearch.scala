package scrapers.marmiton

import common.RegexMatcher
import scala.collection.JavaConversions._
import play.api.libs.json._
import org.jsoup._

case class MarmitonSearch(
  lastResult: Int,
  totalResults: Int,
  results: List[MarmitonResult],
  url: String)
object MarmitonSearch {
  implicit val marmitonSearchFormat = Json.format[MarmitonSearch]

  def create(url: String, content: String, allowSponsored: Boolean): Option[MarmitonSearch] = {
    val page = Jsoup.parse(content)
    val searchTitle = page.select(".m_resultats_recherche_titre").html().replace("\n", "")
    val resultsCount = RegexMatcher.simple(searchTitle, "Recherche pour \"<span class=\"m_term_search\">[^<]*</span>\" - ([0-9]+) / ([0-9]+)<br>")
    val lastResult = resultsCount(0).getOrElse("0").toInt
    val totalResults = resultsCount(1).getOrElse("0").toInt
    val results = page.select(".m_contenu_resultat").iterator().toList.map(elt => MarmitonResult.create(elt.html())).flatten.filter(r => !r.sponsored || allowSponsored)
    Some(MarmitonSearch(lastResult, totalResults, results, url))
  }
}
