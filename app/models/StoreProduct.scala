package models

import models.food.Product
import models.food.Quantity
import models.food.Price
import models.food.PriceQuantity
import scala.util.Random
import play.api.libs.json._

case class ProductPromo(
  product: String,
  badge: String,
  image: String)
object ProductPromo {
  implicit val productPromoFormat = Json.format[ProductPromo]
}

case class ProductRecipe(
  recipe: String,
  image: String)
object ProductRecipe {
  implicit val productRecipeFormat = Json.format[ProductRecipe]
}

case class StoreProduct(
  store: String,
  product: String,
  price: Price,
  genericPrice: PriceQuantity,
  promo: Option[ProductPromo],
  recipe: Option[ProductRecipe])
object StoreProduct {
  implicit val storeProductFormat = Json.format[StoreProduct]

  def mockFor(product: Product, store: String): StoreProduct = {
    val price = if (product.price.isDefined) product.price.get else new Price(new Random().nextDouble() * 3, "€")
    val quantity = if (product.quantity.isDefined) product.quantity.get else new Quantity(new Random().nextDouble() * 1000, "g")
    new StoreProduct(store, product.barcode, price, price.forQuantity(quantity).inGeneric(quantity.unit), None, None)
  }
}
