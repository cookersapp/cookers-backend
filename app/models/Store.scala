package models

import models.food.Product
import models.food.Quantity
import models.food.Price
import models.food.PriceQuantity
import scala.util.Random
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

// TODO add fields: enseigne, type, address, position, size
case class Store(
  id: String,
  name: String,
  color: String,
  logo: String)
object Store {
  implicit val storeFormat = Json.format[Store]

  def from(json: JsValue): Option[Store] = {
    val storeJson = json.as[JsObject] ++ Json.obj("id" -> BSONObjectID.generate.stringify)
    storeJson.asOpt[Store]
  }
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
