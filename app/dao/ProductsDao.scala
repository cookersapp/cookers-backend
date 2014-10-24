package dao

import common.Utils
import models.Product
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

object ProductsDao {
  private val COLLECTION_NAME = "products"
  private val COLLECTION_NAME_OPEN_FOOD_FACTS = "openFoodFactsProducts"
  private val COLLECTION_NAME_PRIXING = "prixingProducts"
  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  private def collectionOff()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_OPEN_FOOD_FACTS)
  private def collectionP()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_PRIXING)

  //def get(barcode: String)(implicit db: DB): Future[Option[Product]] = collection().find(Json.obj("barcode" -> barcode)).one[Product]
  def getOff(barcode: String)(implicit db: DB): Future[Option[JsValue]] = collectionOff().find(Json.obj("barcode" -> barcode)).one[JsValue].map(opt => opt.map(doc => doc \ "data"))
  def getP(barcode: String)(implicit db: DB): Future[Option[String]] = collectionP().find(Json.obj("barcode" -> barcode)).one[JsValue].map(opt => opt.map(doc => (doc \ "data").as[String]))

  //def insert(product: Product)(implicit db: DB): Future[LastError] = collection().insert(product)
  def insertOff(barcode: String, product: JsValue)(implicit db: DB): Future[LastError] = collectionOff().insert(Json.obj("barcode" -> barcode, "data" -> product))
  def insertP(barcode: String, product: String)(implicit db: DB): Future[LastError] = collectionP().insert(Json.obj("barcode" -> barcode, "data" -> product))

  /*def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())*/
}