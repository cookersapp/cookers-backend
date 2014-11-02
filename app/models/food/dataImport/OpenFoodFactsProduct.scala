package models.food.dataImport

import common.Utils
import models.food.Quantity
import dao.ProductsDao
import play.api.libs.json._

case class OpenFoodFactsProductNutrition(
  grade: Option[String],
  levels: Option[JsValue],
  nutriments: Option[JsValue])
object OpenFoodFactsProductNutrition {
  implicit val openFoodFactsProductNutritionFormat = Json.format[OpenFoodFactsProductNutrition]
}

case class OpenFoodFactsProductMore(
  genericName: Option[String],
  imageSmall: Option[String],
  quantityStr: Option[String],
  servingStr: Option[String],
  link: Option[String])
object OpenFoodFactsProductMore {
  implicit val openFoodFactsProductMoreFormat = Json.format[OpenFoodFactsProductMore]
}

case class OpenFoodFactsProduct(
  version: Int,
  barcode: String,
  name: Option[String],
  image: Option[String],
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
  more: OpenFoodFactsProductMore,
  url: String) {
  def isValid: Boolean = {
    this.version == OpenFoodFactsProduct.VERSION
  }
}

object OpenFoodFactsProduct {
  val VERSION = 1
  implicit val openFoodFactsProductFormat = Json.format[OpenFoodFactsProduct]

  def getUrl(barcode: String): String = "http://fr.openfoodfacts.org/api/v0/produit/" + barcode + ".json"

  def create(barcode: String, json: JsValue): Option[OpenFoodFactsProduct] = {
    val nutritionGrade = (json \ "product" \ "nutrition_grade_fr").asOpt[String]
    val nutrientLevels = Utils.toOpt(json \ "product" \ "nutrient_levels")
    val nutriments = Utils.toOpt(json \ "product" \ "nutriments")
    val nutrition = new OpenFoodFactsProductNutrition(nutritionGrade, nutrientLevels, nutriments)

    val genericName = (json \ "product" \ "generic_name").asOpt[String]
    val imageSmall = (json \ "product" \ "image_small_url").asOpt[String]
    val quantityStr = (json \ "product" \ "quantity").asOpt[String]
    val servingStr = (json \ "product" \ "serving_size").asOpt[String]
    val link = (json \ "product" \ "link").asOpt[String]
    val more = new OpenFoodFactsProductMore(genericName, imageSmall, quantityStr, servingStr, link)

    val name = (json \ "product" \ "product_name").asOpt[String]
    val image = (json \ "product" \ "image_url").asOpt[String]
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
    val url = getUrl(barcode)

    isValid(new OpenFoodFactsProduct(VERSION, barcode, name, image, quantity, serving, brands, stores, origins, countries, packaging, labels, categories, ingredients, traces, additives, keywords, nutrition, more, url))
  }

  private def isValid(p: OpenFoodFactsProduct): Option[OpenFoodFactsProduct] = {
    if (!Utils.isEmpty(p.barcode) && p.name.isDefined && p.image.isDefined) Some(p)
    else None
  }

  private def strToList(value: Option[String]): Option[List[String]] = Utils.notEmpty(value.getOrElse("").split(",").toList.map(str => Utils.toOpt(str)).flatten)
}