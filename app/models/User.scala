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
    Some(Json.obj(
      "recipeShiftOffset" -> Math.floor(Math.random() * 10),
      "defaultServings" -> 2,
      "showPrices" -> false,
      "bigImages" -> true,
      "skipCookFeatures" -> false,
      "skipCartFeatures" -> false)),
    None,
    None)
}

object User {
  implicit val userFormat = Json.format[User]
}
