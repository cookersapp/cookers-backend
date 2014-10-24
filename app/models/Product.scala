package models

import play.api.libs.json._

// TODO : add fields: _keywords, ingredients_text, ingredients, stores
case class Product(
  barcode: String,
  name: String,
  genericName: String,
  quantityStr: String,
  quantity: List[Quantity],
  brand: String,
  category: String,
  image: String,
  imageSmall: String,
  source: String)

object Product {
  implicit val productFormat = Json.format[Product]

  def merge(p1: Option[Product], p2: Option[Product]): Option[Product] = {
    if (p1.isEmpty) p2
    else if (p2.isEmpty) p1
    else Some(new Product(
      merge(p1.get.barcode, p2.get.barcode),
      merge(p1.get.name, p2.get.name),
      merge(p1.get.genericName, p2.get.genericName),
      merge(p1.get.quantityStr, p2.get.quantityStr),
      merge(p1.get.quantity, p2.get.quantity),
      merge(p1.get.brand, p2.get.brand),
      merge(p1.get.category, p2.get.category),
      merge(p1.get.image, p2.get.image),
      merge(p1.get.imageSmall, p2.get.imageSmall),
      mergeSource(p1.get.source, p2.get.source)))
  }

  def merge(s1: String, s2: String): String = if (s1 == "") s2 else if (s2 == "") s1 else s1
  def merge(q1: List[Quantity], q2: List[Quantity]): List[Quantity] = q1 ++ q2
  def mergeSource(s1: String, s2: String): String = if (s1 == s2) s1 else s1 + "," + s2
}
