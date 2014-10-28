package models.food

import common.Utils
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import play.api.Logger
import play.api.libs.json._

case class Additive(
  name: String,
  fullName: Option[String],
  url: Option[String])
object Additive {
  implicit val additiveFormat = Json.format[Additive]
}

case class ProductNutrition(
  grade: Option[String],
  levels: JsValue) {
  def isEmpty: Boolean = grade.isEmpty && Utils.isEmpty(levels)
}
object ProductNutrition {
  implicit val productNutritionFormat = Json.format[ProductNutrition]
}

case class ProductInfo(
  description: Option[String],
  tips: Option[String]) {
  def isEmpty: Boolean = description.isEmpty && tips.isEmpty
}
object ProductInfo {
  implicit val productInfoFormat = Json.format[ProductInfo]
}

case class ProductMore(
  allImages: List[String],
  allQuantities: Option[List[Quantity]],
  allServings: Option[List[Quantity]],
  link: Option[String],
  sources: List[String])
object ProductMore {
  implicit val productMore = Json.format[ProductMore]
}

case class Product(
  barcode: String,
  name: String,
  image: String,
  foodId: String,
  quantity: Option[Quantity],
  serving: Option[Quantity],
  rating: Option[Rating],
  price: Option[Price],
  brands: Option[List[String]],
  labels: Option[List[String]],
  categories: Option[List[String]],
  ingredients: Option[List[String]],
  traces: Option[List[String]],
  additives: Option[List[Additive]],
  keywords: Option[List[String]],
  infos: Option[ProductInfo],
  nutrition: Option[ProductNutrition],
  more: ProductMore)

object Product {
  implicit val productFormat = Json.format[Product]

  def mergeSources(p1: Option[CookersProduct], p2: Option[OpenFoodFactsProduct], p3: Option[PrixingProduct]): Option[Product] = {
    if (p1.isEmpty && p2.isEmpty && p3.isEmpty) None
    else if (p1.isDefined && p2.isEmpty && p3.isEmpty) isValid(transform(p1.get))
    else if (p1.isEmpty && p2.isDefined && p3.isEmpty) isValid(transform(p2.get))
    else if (p1.isEmpty && p2.isEmpty && p3.isDefined) isValid(transform(p3.get))
    else if (p1.isDefined && p2.isDefined && p3.isEmpty) isValid(merge(transform(p1.get), transform(p2.get)))
    else if (p1.isDefined && p2.isEmpty && p3.isDefined) isValid(merge(transform(p1.get), transform(p3.get)))
    else if (p1.isEmpty && p2.isDefined && p3.isDefined) isValid(merge(transform(p2.get), transform(p3.get)))
    else isValid(merge(transform(p1.get), transform(p2.get), transform(p3.get)))
  }

  private def isValid(p: Product): Option[Product] = {
    if (!Utils.isEmpty(p.barcode) && !Utils.isEmpty(p.name) && !Utils.isEmpty(p.image) && !Utils.isEmpty(p.foodId)) Some(p)
    else None
  }

  private def transform(product: CookersProduct): Product = {
    val more = new ProductMore(List(), None, None, None, List("cookers"))
    new Product(product.barcode, "", "", product.foodId, None, None, None, None, None, None, None, None, None, None, None, None, None, more)
  }

  private def transform(product: OpenFoodFactsProduct): Product = {
    val barcode = product.barcode
    val name = Utils.first(product.name, product.genericName).getOrElse("Unknown :(")
    val allImages = Utils.asList(product.image, product.imageSmall).distinct
    val image = Utils.head(allImages).getOrElse("")
    val foodId = ""
    val allQuantities = product.quantity
    val quantity = Utils.head(allQuantities)
    val allServings = product.serving
    val serving = Utils.head(allServings)
    val rating = None
    val price = None
    val brands = product.brands
    val labels = product.labels
    val categories = product.categories
    val ingredients = product.ingredients
    val traces = product.traces
    val additives = product.additives.map(elt => elt.map(str => new Additive(str, None, None)))
    val keywords = product.keywords
    val infos = None
    val productNutrition = new ProductNutrition(product.nutrition.grade, product.nutrition.levels)
    val nutrition = if (productNutrition.isEmpty) None else Some(productNutrition)
    val link = product.more.link
    val sources = List("openfoodfacts")
    val more = new ProductMore(allImages, allQuantities, allServings, link, sources)
    new Product(barcode, name, image, foodId, quantity, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, more)
  }

  private def transform(product: PrixingProduct): Product = {
    val barcode = product.barcode
    val name = product.name.getOrElse("")
    val allImages = product.images.getOrElse(List())
    val image = Utils.head(allImages).getOrElse("")
    val foodId = ""
    val quantityStr = product.infos.quantity
    val allQuantities = Quantity.create(quantityStr)
    val quantity = Utils.head(allQuantities)
    val allServings = None
    val serving = None
    val rating = product.rating
    val price = product.price
    val brands = None
    val labels = None
    val categories = product.category.map(str => List(str))
    val ingredients = None
    val traces = None
    val additives = product.additives.map(elt => elt.map(a => new Additive(a.name, Some(a.fullName), a.url)))
    val keywords = None
    val productInfo = new ProductInfo(
      Utils.first(product.infos.description, product.infos.informations, product.infos.presentation),
      Utils.first(product.infos.tips, product.infos.help))
    val infos = if (productInfo.isEmpty) None else Some(productInfo)
    val nutrition = None
    val link = None
    val sources = List("prixing")
    val more = new ProductMore(allImages, allQuantities, allServings, link, sources)
    new Product(barcode, name, image, foodId, quantity, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, more)
  }

  private def merge(p1: Product, p2: Product): Product = {
    val barcode = or(p1.barcode, p2.barcode).getOrElse("")
    val name = or(p1.name, p2.name).getOrElse("")
    val allImages = (p1.more.allImages ++ p2.more.allImages).distinct
    val image = Utils.head(allImages).getOrElse("")
    val foodId = Utils.firstStr(p1.foodId, p2.foodId).getOrElse("")
    val allQuantities = Utils.mergeLists(p1.more.allQuantities, p2.more.allQuantities)
    val quantity = Utils.head(allQuantities)
    val allServings = Utils.mergeLists(p1.more.allServings, p2.more.allServings)
    val serving = Utils.head(allServings)
    val rating = Utils.first(p1.rating, p2.rating)
    val price = Utils.first(p1.price, p2.price)
    val brands = Utils.mergeLists(p1.brands, p2.brands)
    val labels = Utils.mergeLists(p1.labels, p2.labels)
    val categories = Utils.mergeLists(p1.categories, p2.categories)
    val ingredients = Utils.mergeLists(p1.ingredients, p2.ingredients)
    val traces = Utils.mergeLists(p1.traces, p2.traces)
    val additives = Utils.notEmpty(distinct(p1.additives.getOrElse(List()) ++ p2.additives.getOrElse(List())))
    val keywords = Utils.mergeLists(p1.keywords, p2.keywords)
    val infos = Utils.first(p1.infos, p2.infos)
    val nutrition = Utils.first(p1.nutrition, p2.nutrition)
    val link = Utils.first(p1.more.link, p2.more.link)
    val sources = p1.more.sources ++ p2.more.sources
    val more = new ProductMore(allImages, allQuantities, allServings, link, sources)
    new Product(barcode, name, image, foodId, quantity, serving, rating, price, brands, labels, categories, ingredients, traces, additives, keywords, infos, nutrition, more)
  }
  private def merge(p1: Product, p2: Product, p3: Product): Product = merge(p1, merge(p2, p3))

  private def or(values: String*): Option[String] = values.find(str => !Utils.isEmpty(str))
  private def distinct(list: List[Additive]): List[Additive] = {
    list.groupBy(elt => elt.name).map {
      case (_, elts) =>
        val nameOpt = elts.map(elt => Utils.toOpt(elt.name)).find(str => str.isDefined).getOrElse(None)
        val fullName = elts.map(elt => elt.fullName).find(str => str.isDefined).getOrElse(None)
        val url = elts.map(elt => elt.url).find(str => str.isDefined).getOrElse(None)
        nameOpt.map(name => new Additive(name, fullName, url))
    }.toList.flatten
  }
}
