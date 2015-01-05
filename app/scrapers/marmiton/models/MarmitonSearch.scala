package scrapers.marmiton.models

import common.RegexMatcher
import scala.collection.mutable.MutableList
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

  def getUrl(query: Option[String], photoOnly: Option[Boolean], vegetarianOnly: Option[Boolean], noCooking: Option[Boolean], category: Option[String], difficulty: Option[Int],
    cost: Option[Int], inIngredients: Option[Boolean], allowSponsored: Option[Boolean], sort: Option[String], start: Option[Int]): Option[String] = {
    val params: MutableList[String] = MutableList()
    if (query.isDefined && query.get.length() > 0) params += "aqt=" + query.get
    if (photoOnly.isDefined && photoOnly.get) params += "pht=1"
    if (vegetarianOnly.isDefined && vegetarianOnly.get) params += "veg=1"
    if (noCooking.isDefined && noCooking.get) params += "rct=1"
    if (category.isDefined && category.get.length() > 0) params += "dt=" + category.get // must be in : entree, platprincipal, dessert, accompagnement, amusegueule, confiserie, sauce
    if (difficulty.isDefined && 0 < difficulty.get && difficulty.get < 5) params += "dif=" + difficulty.get
    if (cost.isDefined && 0 < cost.get && cost.get < 4) params += "exp=" + cost.get
    if (inIngredients.isDefined && inIngredients.get) params += "st=1"
    if (sort.isDefined && sort.get.length() > 0) params += "sort=" + sort.get // must be in : markdesc, popularitydesc (default: pertinence)
    if (start.isDefined && 0 < start.get) params += "start=" + start.get
    if (params.length > 0)
      Some("http://www.marmiton.org/recettes/recherche.aspx?" + params.mkString("&"))
    else
      None
  }

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
