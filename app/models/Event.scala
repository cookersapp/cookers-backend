package models

import play.api.libs.json.Json
import play.api.libs.json.JsValue

case class DateInfo(year: Int, month: Int, week: Int, dayOfYear: Int, dayOfWeek: Int)

object DateInfo {
  implicit val dateinfoFormat = Json.format[DateInfo]
}

case class Event(
  eventId: String,
  previousEventId: Option[String],
  name: String,
  time: Long,
  dateinfo: DateInfo,
  userId: String,
  source: Option[JsValue],
  data: Option[JsValue],
  debug: Option[Boolean])

object Event {
  implicit val eventFormat = Json.format[Event]
}
