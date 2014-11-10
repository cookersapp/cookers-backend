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
  appVersion: Option[String],
  settings: Option[JsValue],
  closedMessages: Option[List[String]],
  devices: Option[JsValue],
  gravatar: Option[JsValue]) {

  def this(email: String) = this(
    BSONObjectID.generate.stringify,
    email,
    new Date().getTime(),
    new Date().getTime(),
    None,
    Some(Json.obj(
      "recipeShiftOffset" -> Math.floor(new Random().nextDouble() * 10),
      "defaultServings" -> 2,
      "showPrices" -> false,
      "bigImages" -> true,
      "skipCookFeatures" -> false,
      "skipCartFeatures" -> false)),
    None,
    None,
    None)
}

object User {
  implicit val userFormat = Json.format[User]
}
