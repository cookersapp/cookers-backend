package scrapers.marmiton.models

import common.RegexMatcher
import play.api.libs.json._
import org.jsoup._
import org.jsoup.nodes._

// TODO : improve parsing and test it !!!
case class MarmitonIngredient(
  text: String,
  quantity: Option[MarmitonQuantity],
  food: String,
  reference: String)
object MarmitonIngredient {
  implicit val marmitonIngredientFormat = Json.format[MarmitonIngredient]

  def create(content: String): Option[MarmitonIngredient] = {
    val page = Jsoup.parse(RegexMatcher.simple(content, "(?:<span>[^<]*</span> )?- (.*)")(0).getOrElse("").trim())
    val text = page.text()
    val quantity = getQuantity(text)
    val food = getFood(page)
    val reference = getReference(page)
    if (text.length() > 0)
      Some(MarmitonIngredient(text, quantity, food, reference))
    else
      None
  }

  private val UNITS = "g|cl"
  def getQuantity(ingredient: String): Option[MarmitonQuantity] = {
    val res = RegexMatcher.simple(ingredient, "([0-9]+) (" + UNITS + ")")
    res(0).map(value => MarmitonQuantity(value.toInt, res(1).getOrElse("")))
  }

  def getFood(page: Document): String = {
    val link = page.select("a")
    if (link.size() == 1) {
      link.text()
    } else {
      val text = page.text()
      RegexMatcher.simple(text, "[0-9]+ (?:" + UNITS + ") de ([^ ]+)")(0).getOrElse {
        RegexMatcher.simple(text, "(.*) \\(.*\\)")(0).getOrElse("")
      }
    }
  }

  def getReference(page: Document): String = {
    val link = page.select("a")
    if (link.size() == 1) link.attr("href") else ""
  }
}
