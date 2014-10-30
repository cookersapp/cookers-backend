package models

import models.food.Product
import models.food.Quantity
import models.food.Price
import models.food.PriceQuantity
import scala.util.Random
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

case class Store(
  id: String,
  name: String) {
  def this(name: String) = this(BSONObjectID.generate.stringify, name)
}

object Store {
  implicit val storeFormat = Json.format[Store]
}

case class StoreProduct(
  store: String,
  barcode: String,
  price: Price,
  genericPrice: PriceQuantity)

object StoreProduct {
  implicit val storeProductFormat = Json.format[StoreProduct]

  def mockFor(product: Product, store: String): StoreProduct = {
    val price = if (product.price.isDefined) product.price.get else new Price(new Random().nextDouble() * 3, "€")
    val quantity = if (product.quantity.isDefined) product.quantity.get else new Quantity(new Random().nextDouble() * 1000, "g")
    new StoreProduct(store, product.barcode, price, price.forQuantity(quantity).inGeneric(quantity.unit))
  }
}
