package dao

import common.Utils
import models.Product
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.Logger
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._
import reactivemongo.bson.BSONDocument
import models.stats.RecipeEvent

object ProductsDao {
  private val COLLECTION_NAME = "products"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)

  def all()(implicit db: DB): Future[List[Product]] = collection().find(Json.obj()).cursor[Product].toList
  def findByBarcode(barcode: String)(implicit db: DB): Future[Option[Product]] = collection().find(Json.obj("barcode" -> barcode)).one[Product]
  def insert(product: Product)(implicit db: DB): Future[LastError] = collection().insert(product)

  def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }

  def export()(implicit db: DB): Future[List[JsValue]] = DaoUtils.export(db, collection())
  def importCollection(docs: List[JsValue])(implicit db: DB): Future[List[LastError]] = DaoUtils.importCollection(db, collection(), docs)
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())
}