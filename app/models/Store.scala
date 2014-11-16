package models

import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

// TODO add fields: enseigne, type, address, position, size
case class Store(
  id: String,
  name: String,
  color: String,
  logo: String)
object Store {
  implicit val storeFormat = Json.format[Store]

  def from(json: JsValue): Option[Store] = {
    val storeJson = json.as[JsObject] ++ Json.obj("id" -> BSONObjectID.generate.stringify)
    storeJson.asOpt[Store]
  }
}
