package common

import models.Store
import models.User
import models.Event
import models.food.Product
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import models.stats.UserActivity
import play.api.libs.json._

object ApiUtils {
  def Ok(): JsObject = Json.obj("status" -> 200)
  def Ok(data: String): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: JsValue): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: Product): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: CookersProduct): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: OpenFoodFactsProduct): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: PrixingProduct): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: List[UserActivity]): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: Store): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: Event): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: User): JsObject = Json.obj("status" -> 200, "data" -> data)
  def Ok(data: Map[String, Map[String, Int]]): JsObject = Json.obj("status" -> 200, "data" -> data)
  def BadRequest(message: String): JsObject = Json.obj("status" -> 400, "message" -> message)
  def Unauthorized(message: String): JsObject = Json.obj("status" -> 401, "message" -> message)
  def Forbidden(message: String): JsObject = Json.obj("status" -> 403, "message" -> message)
  def NotFound(message: String): JsObject = Json.obj("status" -> 404, "message" -> message)
  def Error(message: String): JsObject = Json.obj("status" -> 500, "message" -> message)
}