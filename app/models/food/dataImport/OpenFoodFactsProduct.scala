package models.food.dataImport
import models.food.Quantity
import dao.ProductsDao
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB
import common.Utils
import play.api.libs.functional.syntax.functionalCanBuildApplicative
import play.api.libs.functional.syntax.toFunctionalBuilderOps
import scala.Option.option2Iterable

case class OpenFoodFactsProductNutrition(
  grade: Option[String],
  levels: JsValue,
  nutriments: JsValue)
object OpenFoodFactsProductNutrition {
  implicit val openFoodFactsProductNutritionFormat = Json.format[OpenFoodFactsProductNutrition]
}

case class OpenFoodFactsProductMore(
  quantityStr: Option[String],
  servingStr: Option[String],
  link: Option[String])
object OpenFoodFactsProductMore {
  implicit val openFoodFactsProductMoreFormat = Json.format[OpenFoodFactsProductMore]
}

case class OpenFoodFactsProduct(
  barcode: String,
  name: Option[String],
  genericName: Option[String],
  image: Option[String],
  imageSmall: Option[String],
  quantity: Option[List[Quantity]],
  serving: Option[List[Quantity]],
  brands: Option[List[String]],
  stores: Option[List[String]],
  origins: Option[List[String]],
  countries: Option[List[String]],
  packaging: Option[List[String]],
  labels: Option[List[String]],
  categories: Option[List[String]],
  ingredients: Option[List[String]],
  traces: Option[List[String]],
  additives: Option[List[String]],
  keywords: Option[List[String]],
  nutrition: OpenFoodFactsProductNutrition,
  more: OpenFoodFactsProductMore)

object OpenFoodFactsProduct {
  implicit val openFoodFactsProductFormat = Json.format[OpenFoodFactsProduct]

  def create(barcode: String, json: JsValue): Option[OpenFoodFactsProduct] = {
    val nutritionGrade = (json \ "product" \ "nutrition_grade_fr").asOpt[String]
    val nutrientLevels = json \ "product" \ "nutrient_levels"
    val nutriments = json \ "product" \ "nutriments"
    val nutrition = new OpenFoodFactsProductNutrition(nutritionGrade, nutrientLevels, nutriments)

    val quantityStr = (json \ "product" \ "quantity").asOpt[String]
    val servingStr = (json \ "product" \ "serving_size").asOpt[String]
    val link = (json \ "product" \ "link").asOpt[String]
    val more = new OpenFoodFactsProductMore(quantityStr, servingStr, link)

    val name = (json \ "product" \ "product_name").asOpt[String]
    val genericName = (json \ "product" \ "generic_name").asOpt[String]
    val image = (json \ "product" \ "image_url").asOpt[String]
    val imageSmall = (json \ "product" \ "image_small_url").asOpt[String]
    val quantity = Quantity.create(quantityStr)
    val serving = Quantity.create(servingStr)
    val brands = strToList((json \ "product" \ "brands").asOpt[String])
    val stores = strToList((json \ "product" \ "stores").asOpt[String])
    val origins = strToList((json \ "product" \ "origins").asOpt[String])
    val countries = strToList((json \ "product" \ "countries").asOpt[String])
    val packaging = strToList((json \ "product" \ "packaging").asOpt[String])
    val labels = strToList((json \ "product" \ "labels").asOpt[String])
    val categories = strToList((json \ "product" \ "categories").asOpt[String])
    val ingredients = strToList((json \ "product" \ "ingredients_text").asOpt[String])
    val traces = strToList((json \ "product" \ "traces").asOpt[String])
    val additives = (json \ "product" \ "additives_tags").asOpt[List[String]]
    val keywords = (json \ "product" \ "_keywords").asOpt[List[String]]

    isValid(new OpenFoodFactsProduct(barcode, name, genericName, image, imageSmall, quantity, serving, brands, stores, origins, countries, packaging, labels, categories, ingredients, traces, additives, keywords, nutrition, more))
  }

  private def isValid(p: OpenFoodFactsProduct): Option[OpenFoodFactsProduct] = {
    if (!Utils.isEmpty(p.barcode) && p.name.isDefined && p.image.isDefined) Some(p)
    else None
  }

  private def strToList(value: Option[String]): Option[List[String]] = Utils.notEmpty(value.getOrElse("").split(",").toList.map(str => Utils.toOpt(str)).flatten)
}