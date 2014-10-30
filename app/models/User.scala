package models

import java.util.Date
import scala.util.Random
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
      "recipeShiftOffset" -> Math.floor(new Random().nextDouble() * 10),
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
