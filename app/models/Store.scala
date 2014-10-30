package models

import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

case class Store(
  id: String,
  name: String) {
  def this(name: String) = this(BSONObjectID.generate.stringify, name)
}

object Store {
  implicit val storeFormat = Json.format[Store]
}
