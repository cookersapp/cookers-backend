package models

import play.api.libs.json._

case class Product(
  barcode: String,
  url: String,
  name: String,
  genericName: String,
  quantityStr: String,
  quantity: List[Quantity],
  brand: String,
  category: String,
  image: String,
  imageSmall: String) {

  def this(csv: Array[String]) = this(
    Product.get(csv, Product.Field.code),
    Product.get(csv, Product.Field.url),
    Product.get(csv, Product.Field.product_name),
    Product.get(csv, Product.Field.generic_name),
    Product.get(csv, Product.Field.quantity),
    Quantity.create(Product.get(csv, Product.Field.quantity)),
    Product.get(csv, Product.Field.brands),
    Product.get(csv, Product.Field.categories),
    Product.get(csv, Product.Field.image_url),
    Product.get(csv, Product.Field.image_small_url))

}

object Product {
  implicit val productFormat = Json.format[Product]

  def get(csv: Array[String], index: Int): String = if (csv.length > index) csv(index) else ""

  def create(csv: Array[String]): Option[Product] = {
    val p = new Product(csv)
    if (p.barcode != "" && p.name != "" && p.image != "") Some(p)
    else None
  }

  object Field {
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
  }
}
