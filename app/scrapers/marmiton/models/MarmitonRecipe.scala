package scrapers.marmiton.models

import common.RegexMatcher
import common.Utils
import scala.collection.JavaConversions._
import play.api.libs.json._
import play.api.Logger
import org.jsoup._
import org.jsoup.nodes._

case class MarmitonRecipe(
  title: String,
  category: String,
  difficulty: String,
  cost: String,
  ratings: Option[MarmitonRating],
  images: List[String],
  preparationTime: Option[MarmitonQuantity],
  cookTime: Option[MarmitonQuantity],
  servings: Option[MarmitonQuantity],
  ingredients: List[MarmitonIngredient],
  instructions: List[String],
  remarks: String,
  recommendedDrink: String,
  comments: List[MarmitonComment],
  relatedRecipes: List[MarmitonRelatedRecipe],
  url: String)
object MarmitonRecipe {
  implicit val marmitonRecipeFormat = Json.format[MarmitonRecipe]

  def create(url: String, content: String): Option[MarmitonRecipe] = {
    val page = Jsoup.parse(content)
    val title = page.select("h1.m_title .item .fn").text()
    val categories = page.select("h1 + .m_content_recette_breadcrumb").text().split(" - ").toList
    val category = Utils.get(categories, 0).getOrElse("")
    val difficulty = Utils.get(categories, 1).getOrElse("")
    val cost = Utils.get(categories, 2).getOrElse("")
    val ratings = MarmitonRating.create(page.select(".hreview-aggregate").html())
    val mainImage = page.select("img.photo").attr("src")
    val moreImages = page.select(".m_content_recette_thumbs a img").iterator().toList.map(elt => elt.attr("src").replace("tn-60x60", "normal"))
    val images = (List(mainImage) ++ moreImages).filter(str => str.length() > 0)
    val preparationTime = MarmitonQuantity.forTime(page.select(".m_content_recette_info .preptime .value-title").attr("title"))
    val cookTime = MarmitonQuantity.forTime(page.select(".m_content_recette_info .cooktime .value-title").attr("title"))
    val servings = MarmitonQuantity.forServings(page.select(".m_content_recette_ingredients span").text())
    val ingredients = page.select(".m_content_recette_ingredients").html().split("<br>").toList.map(str => MarmitonIngredient.create(str)).flatten
    val instructions = getInstructions(page)
    val moreInfos = page.select(".m_content_recette_ps").html()
    val remarks = RegexMatcher.simple(moreInfos, "(?is)<h4>Remarques :</h4>" + RegexMatcher.eol + "<p>(.*?)</p>")(0).getOrElse("")
    val recommendedDrink = RegexMatcher.simple(moreInfos, "(?is)<h4>Boisson conseillée :</h4>" + RegexMatcher.eol + "<p>(.*?)</p>")(0).getOrElse("")
    val comments = page.select(".m_commentaire_row").iterator().toList.map(elt => MarmitonComment.create(elt)).flatten
    val mainRelatedRecipes = page.select("#ctl00_cphMainContent_m_recetteDisplayMore_panelRecetteSimilaire_panelBlocRecettesImages .m_related_item").iterator().toList.map(elt => MarmitonRelatedRecipe.create(elt)).flatten
    val moreRelatedRecipes = page.select("#ctl00_cphMainContent_m_recetteDisplayMore_panelRecetteSimilaire_panelBlocBotify li a").iterator().toList.map(elt => MarmitonRelatedRecipe.createWithListItem(elt)).flatten
    val relatedRecipes = mainRelatedRecipes ++ moreRelatedRecipes
    Some(MarmitonRecipe(title, category, difficulty, cost, ratings, images, preparationTime, cookTime, servings, ingredients, instructions, remarks, recommendedDrink, comments, relatedRecipes, url))
  }

  def getInstructions(page: Document): List[String] = {
    val content = page.select(".m_content_recette_todo").html().replace("\n", "")
    val instructionsHtml = RegexMatcher.simple(content, "(?is)<h4>Préparation de la recette :</h4><br>(.*)<div class=\"m_content_recette_ps\">.*</div>")(0).getOrElse("")
    val instructions = instructionsHtml.trim().split("<br><br>").toList
    instructions.filter(str => str.length() > 0).map(str => Jsoup.parse(str).text())
  }
}
  