package models

import java.util.Date
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

case class User(
  id: String,
  email: String,
  created: Long,
  lastSeen: Long,
  settings: Option[JsValue],
  devices: Option[JsValue],
  gravatar: Option[JsValue]) {

  def this(email: String) = this(
    BSONObjectID.generate.stringify,
    email,
    new Date().getTime(),
    new Date().getTime(),
    Some(JsObject(
      "recipeShiftOffset" -> JsNumber(Math.floor(Math.random() * 10)) ::
        "defaultServings" -> JsNumber(2) ::
        "showPrices" -> JsBoolean(false) ::
        "bigImages" -> JsBoolean(true) ::
        "skipCookFeatures" -> JsBoolean(false) ::
        "skipCartFeatures" -> JsBoolean(false) ::
        Nil)),
    None,
    None)
}

object User {
  import play.api.libs.json.Json

  implicit val userFormat = Json.format[User]
}
