package models

import play.api.libs.json.JsValue

case class Event(
  eventId: String,
  previousEventId: Option[String],
  name: String,
  time: Long,
  userId: String,
  source: Option[JsValue],
  data: Option[JsValue],
  debug: Option[Boolean])

object Event {
  import play.api.libs.json.Json

  implicit val eventFormat = Json.format[Event]
}
