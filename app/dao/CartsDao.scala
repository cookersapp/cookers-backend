package dao

import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import reactivemongo.api.DB
import reactivemongo.core.commands._
import play.modules.reactivemongo.json.collection.JSONCollection

object CartsDao {
  private val COLLECTION_NAME = "userCarts"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def getCarts(user: String)(implicit db: DB): Future[List[JsValue]] = collection().find(Json.obj("user" -> user)).cursor[JsValue].toList.map(opt => opt.map(doc => (doc \ "data").asOpt[JsValue]).flatten)
  def addArchivedCart(user: String, cartId: String, cart: JsValue)(implicit db: DB): Future[LastError] = collection().insert(Json.obj("user" -> user, "cart" -> cartId, "data" -> cart))
}
