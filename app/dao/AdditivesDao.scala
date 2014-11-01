package dao

import common.Utils
import models.food.Product
import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import models.food.dataImport.PrixingAdditive
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._
import reactivemongo.bson.BSONDocument

object AdditivesDao {
  private val COLLECTION_PRIXING = "importPrixingAdditives"

  private def collectionPrixing()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_PRIXING)

  def getPrixingAdditives()(implicit db: DB): Future[List[PrixingAdditive]] =
    collectionPrixing().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[PrixingAdditive]).flatten)
  def getPrixingAdditive(reference: String)(implicit db: DB): Future[Option[PrixingAdditive]] =
    collectionPrixing().find(Json.obj("key" -> reference)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[PrixingAdditive]))
  def savePrixingAdditive(reference: String, additive: String, additiveFormated: PrixingAdditive)(implicit db: DB): Future[LastError] =
    collectionPrixing().update(Json.obj("key" -> reference), Json.obj(
      "key" -> reference,
      "saved" -> new Date().getTime(),
      "source" -> additive,
      "data" -> additiveFormated), upsert = true)

  /*def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())*/
}