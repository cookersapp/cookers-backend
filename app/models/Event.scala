package models

import play.api.libs.json._

case class DateInfo(year: Int, month: Int, week: Int, dayOfYear: Int, dayOfWeek: Int)

object DateInfo {
  implicit val dateinfoFormat = Json.format[DateInfo]
}

case class Event(
  id: String,
  prevId: Option[String],
  name: String,
  time: Long,
  dateinfo: DateInfo,
  user: String,
  device: Option[String], // should be Option to be compatible with events from app 1.1.0
  appVersion: Option[String], // should be Option to be compatible with events from app 1.1.0
  source: Option[JsValue],
  data: Option[JsValue])

object Event {
  implicit val eventFormat = Json.format[Event]
}
