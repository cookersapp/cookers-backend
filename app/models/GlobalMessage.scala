package models

import play.api.libs.json._

case class GlobalMessage(
  id: String,
  sticky: Boolean,
  category: String,
  content: String,
  versions: List[String])

object GlobalMessage {
  implicit val globalMessageFormat = Json.format[GlobalMessage]
}
