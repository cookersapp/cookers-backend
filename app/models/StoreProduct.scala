package models

import models.food.Product
import models.food.Quantity
import models.food.Price
import models.food.PriceQuantity
import scala.util.Random
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

case class ProductPromo(
  product: String,
  badge: String,
  name: Option[String],
  image: String)
object ProductPromo {
  implicit val productPromoFormat = Json.format[ProductPromo]
}

case class ProductRecipe(
  id: String,
  image: String)
object ProductRecipe {
  implicit val productRecipeFormat = Json.format[ProductRecipe]
}

case class StoreProduct(
  id: String, // only used for admin CRUD
  store: String,
  product: String,
  price: Price,
  genericPrice: PriceQuantity,
  promo: Option[ProductPromo],
  recipe: Option[ProductRecipe])
object StoreProduct {
  implicit val storeProductFormat = Json.format[StoreProduct]

  def from(json: JsValue): Option[StoreProduct] = {
    val id = (json \ "product").asOpt[String].getOrElse(BSONObjectID.generate.stringify)
    val storeProductJson = json.as[JsObject] ++ Json.obj("id" -> id)
    storeProductJson.asOpt[StoreProduct]
  }

  def mockFor(product: Product, store: String): StoreProduct = {
    val price = if (product.price.isDefined) product.price.get else new Price(new Random().nextDouble() * 3, "€")
    val quantity = if (product.quantity.isDefined) product.quantity.get else new Quantity(new Random().nextDouble() * 1000, "g")
    new StoreProduct("", store, product.barcode, price, price.forQuantity(quantity).inGeneric(quantity.unit), None, None)
  }
}
