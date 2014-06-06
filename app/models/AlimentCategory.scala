package models

import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import reactivemongo.bson._

case class AlimentCategory(
  id: String,
  name: String)

object AlimentCategory {
  val mapForm = mapping(
    "id" -> text,
    "name" -> nonEmptyText)(AlimentCategory.apply)(AlimentCategory.unapply)
}

object AlimentCategoryFormat {
  import play.api.libs.json.Json
  implicit val alimentCategoryFormat = Json.format[AlimentCategory]
  implicit object AlimentCategoryReader extends BSONDocumentReader[AlimentCategory] {
    def read(doc: BSONDocument): AlimentCategory = AlimentCategory(doc.getAs[String]("id").get, doc.getAs[String]("name").get)
  }
}
