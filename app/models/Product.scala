package models

import common.Utils
import common.OpenFoodFactsProduct
import common.PrixingProduct
import play.api.Logger
import play.api.libs.json._

case class Price(
  value: Double,
  currency: String)
object Price {
  implicit val priceFormat = Json.format[Price]
}

case class Additive(
  id: String,
  name: String,
  fullName: String,
  url: String)
object Additive {
  implicit val additiveFormat = Json.format[Additive]
}

case class ProductNutrition(
  grade: String,
  levels: JsValue)
object ProductNutrition {
  implicit val productNutritionFormat = Json.format[ProductNutrition]
}

case class ProductInfo(description: String, tips: String)
object ProductInfo {
  implicit val productInfoFormat = Json.format[ProductInfo]
}

case class Product(
  barcode: String,
  name: String,
  images: List[String],
  quantityStr: String,
  quantity: List[Quantity],
  servingStr: String,
  serving: List[Quantity],
  rating: Double,
  price: Price,
  brands: List[String],
  labels: List[String],
  categories: List[String],
  ingredients: List[String],
  traces: List[String],
  additives: List[Additive],
  keywords: List[String],
  infos: ProductInfo,
  nutrition: ProductNutrition,
  link: String,
  sources: List[String])

object Product {
  implicit val productFormat = Json.format[Product]

  def mergeSources(p1: Option[OpenFoodFactsProduct], p2: Option[PrixingProduct]): Option[Product] = {
    if (p1.isEmpty && p2.isEmpty) None
    else if (p1.isDefined && p2.isEmpty) transform(p1.get)
    else if (p1.isEmpty && p2.isDefined) transform(p2.get)
    else merge(transform(p1.get), transform(p2.get))
  }

  def merge(p1: Option[Product], p2: Option[Product]): Option[Product] = {
    if (p1.isEmpty) p2
    else if (p2.isEmpty) p1
    else merge(p1.get, p2.get)
  }

  def transform(product: OpenFoodFactsProduct): Option[Product] = {
    val barcode = product.barcode
    val name = or(product.name, product.genericName)
    val images = list(product.image, product.imageSmall)
    val quantity = product.quantity
    val quantityStr = product.more.quantityStr
    val serving = product.serving
    val servingStr = product.more.servingStr
    val rating = Utils.NaN
    val price = null
    val brands = product.brands
    val labels = product.labels
    val categories = product.categories
    val ingredients = product.ingredients
    val traces = product.traces
    val additives = product.additives.map(str => new Additive(null, str, null, null))
    val keywords = product.keywords
    val infos = null
    val nutrition = new ProductNutrition(product.nutrition.grade, product.nutrition.levels)
    val link = product.more.link
    val sources = List("openfoodfacts")
    isValid(new Product(barcode, name, images, quantityStr, quantity, servingStr, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, link, sources))
  }

  def transform(product: PrixingProduct): Option[Product] = {
    val barcode = product.barcode
    val name = product.name
    val images = product.images
    val quantityStr = product.infos.quantity
    val quantity = Quantity.create(quantityStr)
    val servingStr = null
    val serving = List()
    val rating = product.rating
    val price = new Price(product.price.value, product.price.currency)
    val brands = List()
    val labels = List()
    val categories = List(product.category)
    val ingredients = List()
    val traces = List()
    val additives = product.additives.map(a => new Additive(a.id, a.name, a.fullName, a.url))
    val keywords = List()
    val infos = new ProductInfo(
      or(product.infos.description, product.infos.informations, product.infos.presentation),
      or(product.infos.tips, product.infos.help))
    val nutrition = null
    val link = null
    val sources = List("prixing")
    isValid(new Product(barcode, name, images, quantityStr, quantity, servingStr, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, link, sources))
  }

  private def merge(p1: Product, p2: Product): Option[Product] = {
    val barcode = or(p1.barcode, p2.barcode)
    val name = or(p1.name, p2.name)
    val images = (p1.images ++ p2.images).distinct
    val quantityStr = or(p1.quantityStr, p2.quantityStr)
    val quantity = Quantity.create(quantityStr)
    val servingStr = or(p1.servingStr, p2.servingStr)
    val serving = Quantity.create(servingStr)
    val rating = or(p1.rating, p2.rating)
    val price = or(p1.price, p2.price)
    val brands = (p1.brands ++ p2.brands).distinct
    val labels = (p1.labels ++ p2.labels).distinct
    val categories = (p1.categories ++ p2.categories).distinct
    val ingredients = (p1.ingredients ++ p2.ingredients).distinct
    val traces = (p1.traces ++ p2.traces).distinct
    val additives = distinct(p1.additives ++ p2.additives)
    val keywords = p1.keywords ++ p2.keywords
    val infos = or(p1.infos, p2.infos)
    val nutrition = or(p1.nutrition, p2.nutrition)
    val link = or(p1.link, p2.link)
    val sources = p1.sources ++ p2.sources
    isValid(new Product(barcode, name, images, quantityStr, quantity, servingStr, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, link, sources))
  }

  private def isValid(p: Product): Option[Product] = {
    if (p.barcode != "" && p.name != "" && !p.images.isEmpty) Some(p)
    else None
  }

  private def or(values: String*): String = values.find(str => str != null && str != "").getOrElse(null)
  private def or(values: Double*): Double = values.find(d => d != Utils.NaN).getOrElse(Utils.NaN)
  private def or(values: Price*): Price = values.find(p => p != null && p.value != Utils.NaN).getOrElse(null)
  private def or(values: ProductInfo*): ProductInfo = values.find(p => p != null).getOrElse(null)
  private def or(values: ProductNutrition*): ProductNutrition = values.find(p => p != null).getOrElse(null)
  private def list(values: String*): List[String] = values.filter(str => str != "").toList
  private def distinct(list: List[Additive]): List[Additive] = {
    list.groupBy(elt => elt.name).map {
      case (_, elts) =>
        new Additive(
          elts.map(elt => elt.id).find(str => str != null && str != "").getOrElse(null),
          elts.map(elt => elt.name).find(str => str != null && str != "").getOrElse(null),
          elts.map(elt => elt.fullName).find(str => str != null && str != "").getOrElse(null),
          elts.map(elt => elt.url).find(str => str != null && str != "").getOrElse(null))
    }.toList
  }
}
