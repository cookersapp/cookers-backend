package common

import models.food.Product
import models.food.Quantity
import dao.ProductsDao
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

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
}

object OpenFoodFacts {
  val baseUrl = "http://fr.openfoodfacts.org"
  val databaseUrl = baseUrl + "/data/fr.openfoodfacts.org.products.csv"
  def productUrl(barcode: String) = baseUrl + "/api/v0/produit/" + barcode + ".json"

  def getProduct(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] = {
    ProductsDao.getOff(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(create(barcode, opt.get))
      } else {
        WS.url(productUrl(barcode)).get().map { response =>
          val productOpt = create(barcode, response.json)
          if (productOpt.isDefined) {
            ProductsDao.insertOff(barcode, response.json)
          }
          productOpt
        }
      }
    }
  }

  private def create(barcode: String, json: JsValue): Option[OpenFoodFactsProduct] = {
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

  /*def getDatabase(): Future[List[OpenFoodFactsProduct]] = {
    WS.url(databaseUrl).withTimeout(1200000).get().map { response =>
      val csv = new String(response.body.getBytes("ISO-8859-1"), "UTF-8")
      val lines = csv.split("\n").tail.toList
      lines.map(line => create(line.split("\t"))).filter(opt => opt.isDefined).map(opt => opt.get)
    }
  }

  private def create(csv: Array[String]): Option[OpenFoodFactsProduct] = {
    val nutritionGrade = ""
    val nutrientLevels = Json.obj()
    val nutriments = Json.obj()
    val nutrition = new OpenFoodFactsProductNutrition(nutritionGrade, nutrientLevels, nutriments)

    val quantityStr = get(csv, Field.quantity)
    val servingStr = null
    val link = null
    val more = new OpenFoodFactsProductMore(quantityStr, servingStr, link)

    val barcode = get(csv, Field.code)
    val name = get(csv, Field.product_name)
    val genericName = get(csv, Field.generic_name)
    val image = get(csv, Field.image_url)
    val imageSmall = get(csv, Field.image_small_url)
    val quantity = Quantity.create(quantityStr)
    val serving = Quantity.create(servingStr)
    val brands = strToList(get(csv, Field.brands))
    val stores = List()
    val origins = List()
    val countries = List()
    val packaging = List()
    val labels = List()
    val categories = strToList(get(csv, Field.categories))
    val ingredients = List()
    val traces = List()
    val additives = List()
    val keywords = List()

    isValid(new OpenFoodFactsProduct(barcode, name, genericName, image, imageSmall, quantity, serving, brands, stores, origins, countries, packaging, labels, categories, ingredients, traces, additives, keywords, nutrition, more))
  }

  private def get(csv: Array[String], index: Int): String = if (csv.length > index) csv(index) else ""

  private object Field {
    val code = 0
    val url = 1
    val creator = 2
    val created_t = 3
    val created_datetime = 4
    val last_modified_t = 5
    val last_modified_datetime = 6
    val product_name = 7
    val generic_name = 8
    val quantity = 9
    val packaging = 10
    val packaging_tags = 11
    val brands = 12
    val brands_tags = 13
    val categories = 14
    val categories_tags = 15
    val categories_fr = 16
    val origins = 17
    val origins_tags = 18
    val manufacturing_places = 19
    val manufacturing_places_tags = 20
    val labels = 21
    val labels_tags = 22
    val labels_fr = 23
    val emb_codes = 24
    val emb_codes_tags = 25
    val first_packaging_code_geo = 26 // cel AA
    val cities = 27
    val cities_tags = 28
    val purchase_places = 29
    val stores = 30
    val countries = 31
    val countries_tags = 32
    val countries_fr = 33
    val ingredients_text = 34
    val traces = 35
    val traces_tags = 36
    val serving_size = 37
    val no_nutriments = 38
    val additives_n = 39
    val additives = 40
    val additives_tags = 41
    val ingredients_from_palm_oil_n = 42
    val ingredients_from_palm_oil = 43
    val ingredients_from_palm_oil_tags = 44
    val ingredients_that_may_be_from_palm_oil_n = 45
    val ingredients_that_may_be_from_palm_oil = 46
    val ingredients_that_may_be_from_palm_oil_tags = 47
    val nutrition_grade_fr = 48
    val main_category = 49
    val main_category_fr = 50
    val image_url = 51
    val image_small_url = 52
    val energy_100g = 53 // cel BB
    val proteins_100g = 54
    val casein_100g = 55
    val serum_proteins_100g = 56
    val nucleotides_100g = 57
    val carbohydrates_100g = 58
    val sugars_100g = 59
    val sucrose_100g = 60
    val glucose_100g = 61
    val fructose_100g = 62
    val lactose_100g = 63
    val maltose_100g = 64
    val maltodextrins_100g = 65
    val starch_100g = 66
    val polyols_100g = 67
    val fat_100g = 68
    val saturated_fat_100g = 69
    val butyric_acid_100g = 70
    val caproic_acid_100g = 71
    val caprylic_acid_100g = 72
    val capric_acid_100g = 73
    val lauric_acid_100g = 74
    val myristic_acid_100g = 75
    val palmitic_acid_100g = 76
    val stearic_acid_100g = 77
    val arachidic_acid_100g = 78
    val behenic_acid_100g = 79
    val lignoceric_acid_100g = 80 // cel CC
    val cerotic_acid_100g = 81
    val montanic_acid_100g = 82
    val melissic_acid_100g = 83
    val monounsaturated_fat_100g = 84
    val polyunsaturated_fat_100g = 85
    val omega_3_fat_100g = 86
    val alpha_linolenic_acid_100g = 87
    val eicosapentaenoic_acid_100g = 88
    val docosahexaenoic_acid_100g = 89
    val omega_6_fat_100g = 90
    val linoleic_acid_100g = 91
    val arachidonic_acid_100g = 92
    val gamma_linolenic_acid_100g = 93
    val dihomo_gamma_linolenic_acid_100g = 94
    val omega_9_fat_100g = 95
    val oleic_acid_100g = 96
    val elaidic_acid_100g = 97
    val gondoic_acid_100g = 98
    val mead_acid_100g = 99 // cel CV
  }*/
}