package models

import org.joda.time.DateTime

case class Meta(date: DateTime, by: String)

object MetaFormat {
  import play.api.libs.json.Json

  implicit val metaFormat = Json.format[Meta]
}
