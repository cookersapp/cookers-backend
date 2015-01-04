package scrapers.marmiton

import play.api.libs.json._
import org.jsoup.nodes._

case class MarmitonRelatedRecipe(
  name: String,
  link: String,
  image: String)
object MarmitonRelatedRecipe {
  implicit val marmitonRelatedRecipeFormat = Json.format[MarmitonRelatedRecipe]

  def create(elt: Element): Option[MarmitonRelatedRecipe] = {
    val a = elt.select(".m_related_label a")
    val name = a.text()
    val link = "http://www.marmiton.org" + a.attr("href")
    val image = elt.select(".m_related_thumb a img").attr("src")
    Some(MarmitonRelatedRecipe(name, link, image))
  }
}
