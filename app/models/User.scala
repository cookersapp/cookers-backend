package models

import java.util.Date
import play.api.libs.json.JsValue
import reactivemongo.bson.BSONObjectID
import play.api.libs.json.JsObject
import play.api.libs.json.JsNumber
import play.api.libs.json.JsBoolean
import play.api.libs.json.Json

case class User(
  id: String,
  email: String,
  created: Long,
  lastSeen: Long,
  devices: Option[JsValue],
  settings: Option[JsValue],
  data: Option[JsValue],
  gravatar: Option[JsValue]) {

  def this(email: String) = this(
    BSONObjectID.generate.stringify,
    email,
    new Date().getTime(),
    new Date().getTime(),
    None,
    Some(JsObject(
      "recipeShiftOffset" -> JsNumber(Math.floor(Math.random() * 10)) ::
        "defaultServings" -> JsNumber(2) ::
        "showPrices" -> JsBoolean(false) ::
        "bigImages" -> JsBoolean(true) ::
        Nil)),
    Some(JsObject(
      "skipCookFeatures" -> JsBoolean(false) ::
        "skipCartFeatures" -> JsBoolean(false) ::
        Nil)),
    None)

}

object User {
  import play.api.libs.json.Json

  implicit val userFormat = Json.format[User]
}
