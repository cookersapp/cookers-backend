package models.food

import common.Utils
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.OpenFoodFactsProductNutrition
import models.food.dataImport.PrixingProduct
import play.api.Logger
import play.api.libs.json._

case class ProductNutriment(
  level: String,
  quantity_100g: Option[Double])
object ProductNutriment {
  implicit val productNutrimentFormat = Json.format[ProductNutriment]
}

case class ProductNutrition(
  grade: Option[String],
  nutriments: Option[Map[String, ProductNutriment]])
object ProductNutrition {
  implicit val productNutritionFormat = Json.format[ProductNutrition]

  def from(nutrition: OpenFoodFactsProductNutrition): Option[ProductNutrition] = {
    val grade = nutrition.grade
    val nutriments = nutrition.levels.flatMap(_.asOpt[Map[String, String]]).map {
      _.map {
        case (nutriment, level) => (nutriment, new ProductNutriment(level, get100g(nutriment, nutrition.nutriments)))
      }
    }
    if (grade.isEmpty && nutriments.isEmpty) None else Some(new ProductNutrition(grade, nutriments))
  }

  private def get100g(nutriment: String, jsonOpt: Option[JsValue]): Option[Double] = {
    jsonOpt.flatMap { json =>
      val value = (json \ (nutriment + "_100g"))
      val strOpt = value.asOpt[String]
      if (strOpt.isDefined) strOpt.map(_.toDouble) else value.asOpt[Double]
    }
  }
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
  brands: Option[List[String]],
  categories: Option[List[String]],
  link: Option[String],
  sources: List[String])
object ProductMore {
  implicit val productMore = Json.format[ProductMore]
}

case class Product(
  id: String,
  barcode: String,
  name: String,
  image: String,
  foodId: String,
  quantity: Option[Quantity],
  serving: Option[Quantity],
  rating: Option[Rating],
  price: Option[Price],
  brand: Option[String],
  category: Option[String],
  labels: Option[List[String]],
  ingredients: Option[List[String]],
  traces: Option[List[String]],
  additives: Option[List[Additive]],
  keywords: Option[List[String]],
  infos: Option[ProductInfo],
  nutrition: Option[ProductNutrition],
  more: ProductMore) {
  def withAdditives(additives: List[Additive]) = new Product(this.id, this.barcode, this.name, this.image, this.foodId, this.quantity, this.serving, this.rating, this.price, this.brand, this.category, this.labels, this.ingredients, this.traces, Some(additives), this.keywords, this.infos, this.nutrition, this.more)
}

object Product {
  implicit val productFormat = Json.format[Product]

  def mergeSources(p1: Option[CookersProduct], p2: Option[OpenFoodFactsProduct], p3: Option[PrixingProduct]): Option[Product] = {
    val r1 = if (p1.isDefined) Some(from(p1.get)) else None
    val r2 = if (p2.isDefined) Some(from(p2.get)) else None
    val r3 = if (p3.isDefined) Some(from(p3.get)) else None
    mergeSources(List(r1, r2, r3).flatten)
  }

  def mergeSources(list: List[Product]): Option[Product] = {
    if (list.isEmpty) None
    else if (list.size == 1) isValid(list(0))
    else isValid(list.tail.foldLeft(list(0)) { case (acc, elt) => merge(acc, elt) })
  }

  private def isValid(p: Product): Option[Product] = {
    if (!Utils.isEmpty(p.barcode) && !Utils.isEmpty(p.name) && !Utils.isEmpty(p.image) && !Utils.isEmpty(p.foodId)) Some(p)
    else None
  }

  private def from(product: CookersProduct): Product = {
    val more = new ProductMore(List(), None, None, None, None, None, List("cookers"))
    new Product(product.barcode, product.barcode, "", "", product.foodId, None, None, None, None, None, None, None, None, None, None, None, None, None, more)
  }

  private def from(product: OpenFoodFactsProduct): Product = {
    val barcode = product.barcode
    val name = Utils.first(product.name, product.more.genericName).getOrElse("Unknown :(")
    val allImages = Utils.asList(product.image, product.more.imageSmall).distinct
    val image = Utils.head(allImages).getOrElse("")
    val foodId = ""
    val allQuantities = product.quantity
    val quantity = Utils.head(allQuantities)
    val allServings = product.serving
    val serving = Utils.head(allServings)
    val rating = None
    val price = None
    val brands = product.brands
    val brand = brands.flatMap(Utils.firstStr(_))
    val categories = product.categories
    val category = categories.flatMap(Utils.firstStr(_))
    val labels = product.labels
    val ingredients = product.ingredients
    val traces = product.traces
    val additives = product.additives.map(list => list.map(str => new Additive(str)))
    val keywords = product.keywords
    val infos = None
    val nutrition = ProductNutrition.from(product.nutrition)
    val link = product.more.link
    val sources = List("openfoodfacts")
    val more = new ProductMore(allImages, allQuantities, allServings, brands, categories, link, sources)
    new Product(barcode, barcode, name, image, foodId, quantity, serving, rating, price, brand, category, labels, ingredients, traces, additives, keywords, infos, nutrition, more)
  }

  private def from(product: PrixingProduct): Product = {
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
    val brand = None
    val categories = product.category.map(List(_))
    val category = categories.flatMap(Utils.firstStr(_))
    val labels = None
    val ingredients = None
    val traces = None
    val additives = product.additives.map(list => list.map(additive => Additive.from(additive)))
    val keywords = None
    val productInfo = new ProductInfo(
      Utils.first(product.infos.description, product.infos.informations, product.infos.presentation),
      Utils.first(product.infos.tips, product.infos.help))
    val infos = if (productInfo.isEmpty) None else Some(productInfo)
    val nutrition = None
    val link = None
    val sources = List("prixing")
    val more = new ProductMore(allImages, allQuantities, allServings, brands, categories, link, sources)
    new Product(barcode, barcode, name, image, foodId, quantity, serving, rating, price, brand, category, labels, ingredients, traces, additives, keywords, infos, nutrition, more)
  }

  private def merge(p1: Product, p2: Product): Product = {
    val barcode = Utils.firstStr(p1.barcode, p2.barcode).getOrElse("")
    val name = Utils.firstStr(p1.name, p2.name).getOrElse("")
    val allImages = (p1.more.allImages ++ p2.more.allImages).distinct
    val image = Utils.head(allImages).getOrElse("")
    val foodId = Utils.firstStr(p1.foodId, p2.foodId).getOrElse("")
    val allQuantities = Utils.mergeLists(p1.more.allQuantities, p2.more.allQuantities)
    val quantity = Utils.head(allQuantities)
    val allServings = Utils.mergeLists(p1.more.allServings, p2.more.allServings)
    val serving = Utils.head(allServings)
    val rating = Utils.first(p1.rating, p2.rating)
    val price = Utils.first(p1.price, p2.price)
    val brands = Utils.mergeLists(p1.more.brands, p2.more.brands)
    val brand = brands.flatMap(Utils.firstStr(_))
    val categories = Utils.mergeLists(p1.more.categories, p2.more.categories)
    val category = categories.flatMap(Utils.firstStr(_))
    val labels = Utils.mergeLists(p1.labels, p2.labels)
    val ingredients = Utils.mergeLists(p1.ingredients, p2.ingredients)
    val traces = Utils.mergeLists(p1.traces, p2.traces)
    val additives = Utils.notEmpty(distinct(p1.additives.getOrElse(List()) ++ p2.additives.getOrElse(List())))
    val keywords = Utils.mergeLists(p1.keywords, p2.keywords)
    val infos = Utils.first(p1.infos, p2.infos)
    val nutrition = Utils.first(p1.nutrition, p2.nutrition)
    val link = Utils.first(p1.more.link, p2.more.link)
    val sources = p1.more.sources ++ p2.more.sources
    val more = new ProductMore(allImages, allQuantities, allServings, brands, categories, link, sources)
    new Product(barcode, barcode, name, image, foodId, quantity, serving, rating, price, brand, category, labels, ingredients, traces, additives, keywords, infos, nutrition, more)
  }

  private def distinct(list: List[Additive]): List[Additive] = {
    list.groupBy(elt => elt.reference).map {
      case (_, elts) =>
        Additive.mergeSources(elts)
    }.toList.flatten
  }
}
