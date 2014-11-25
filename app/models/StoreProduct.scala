package models

import common.Utils
import models.food.Product
import models.food.Quantity
import models.food.Price
import models.food.PriceQuantity
import models.food.dataImport.CookersProduct
import dao.ProductsDao
import scala.util.Random
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import reactivemongo.api.DB

case class ProductPromoBenefit(
  category: String,
  value: Double)
object ProductPromoBenefit {
  implicit val productPromoBenefitFormat = Json.format[ProductPromoBenefit]
}

case class ProductPromo(
  id: String,
  product: String,
  foodId: String,
  name: String,
  badge: String,
  benefit: ProductPromoBenefit,
  image: String)
object ProductPromo {
  implicit val productPromoFormat = Json.format[ProductPromo]
}

case class ProductRecommandation(
  id: String,
  category: String,
  reference: String,
  name: String,
  image: String)
object ProductRecommandation {
  implicit val productRecommandationFormat = Json.format[ProductRecommandation]
}

case class StoreProduct(
  id: String, // only used for admin CRUD
  store: String,
  product: String,
  price: Price,
  genericPrice: PriceQuantity,
  promos: Option[List[ProductPromo]],
  recommandations: Option[List[ProductRecommandation]])
object StoreProduct {
  implicit val storeProductFormat = Json.format[StoreProduct]

  def from(json: JsValue)(implicit db: DB): Future[Option[StoreProduct]] = {
    (json \ "product").asOpt[String].map { product =>
      (json \ "promos").asOpt[List[JsValue]].map(opt => opt.map { promoJson =>
        (promoJson \ "product").asOpt[String].map { promoProduct =>
          ProductsDao.getCookers(promoProduct)
            .map(_.map(cookersProduct => cookersProduct.foodId).getOrElse(CookersProduct.defaultFoodId))
            .map { foodId => Some(promoJson.as[JsObject] ++ Json.obj("foodId" -> foodId)) }
        }.getOrElse(Future.successful(None))
      }).map(results => Future.sequence(results).map(optList => Utils.notEmpty(optList.flatten)))
        .map(_.map(promos => json.as[JsObject] ++ Json.obj("id" -> product, "promos" -> promos)))
        .getOrElse(Future.successful(json.as[JsObject] ++ Json.obj("id" -> product)))
        .map(storeProductJson => storeProductJson.asOpt[StoreProduct])
    }.getOrElse(Future.successful(None))
  }

  def mockFor(product: Product, store: String): StoreProduct = {
    val price = if (product.price.isDefined) product.price.get else new Price(new Random().nextDouble() * 3, "€")
    val quantity = if (product.quantity.isDefined) product.quantity.get else new Quantity(new Random().nextDouble() * 1000, "g")
    new StoreProduct("", store, product.barcode, price, price.forQuantity(quantity).inGeneric(quantity.unit), None, None)
  }
}
