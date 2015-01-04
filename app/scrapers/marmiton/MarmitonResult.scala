package scrapers.marmiton

import common.Utils
import scala.collection.JavaConversions._
import play.api.libs.json._
import org.jsoup._
import common.RegexMatcher

case class MarmitonResult(
  name: String,
  link: String,
  rating: Int,
  voters: Int,
  category: String,
  difficulty: String,
  cost: String,
  preparationTime: Option[MarmitonQuantity],
  cookTime: Option[MarmitonQuantity],
  text: String,
  vegetarian: Boolean,
  sponsored: Boolean)
object MarmitonResult {
  implicit val marmitonResultFormat = Json.format[MarmitonResult]

  def create(content: String): Option[MarmitonResult] = {
    val page = Jsoup.parse(content)
    val title = page.select(".m_titre_resultat a")
    val name = title.text()
    val link = "http://www.marmiton.org" + title.attr("href")
    val rating = page.select(".m_note_resultat .m_recette_note1").iterator().toList.size()
    val voters = RegexMatcher.simple(page.select(".m_recette_nb_votes").text(), "\\(([0-9]+) votes\\)")(0).getOrElse("0").toInt
    val categories = page.select(".m_detail_recette").text().split(" - ").toList
    val category = Utils.get(categories, 1).getOrElse("")
    val difficulty = Utils.get(categories, 2).getOrElse("")
    val cost = Utils.get(categories, 3).getOrElse("")
    val vegetarian = Utils.get(categories, 4).getOrElse("").length() > 0
    val preparationTime = MarmitonQuantity.forTime(page.select(".m_detail_time div:first-child").text().trim())
    val cookTime = MarmitonQuantity.forTime(page.select(".m_detail_time div:nth-child(2)").text().trim())
    val text = page.select(".m_texte_resultat").text()
    val sponsored = page.select(".m_resultat_sponso").text().length() > 0
    Some(MarmitonResult(name, link, rating, voters, category, difficulty, cost, preparationTime, cookTime, text, vegetarian, sponsored))
  }
}
