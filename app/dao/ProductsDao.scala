package dao

import common.Utils
import models.food.Product
import models.food.dataImport.CookersProduct
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
  private val COLLECTION_NAME_COOKERS = "cookersProducts"
  private val COLLECTION_NAME_OPEN_FOOD_FACTS = "openFoodFactsProducts"
  private val COLLECTION_NAME_PRIXING = "prixingProducts"
  // http://www.product-open-data.com/
  // http://www.noteo.info/
  // http://www.shopwise.fr/
  //private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  private def collectionCookers()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_COOKERS)
  private def collectionOpenFoodFacts()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_OPEN_FOOD_FACTS)
  private def collectionPrixing()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_PRIXING)

  //def get(barcode: String)(implicit db: DB): Future[Option[Product]] = collection().find(Json.obj("barcode" -> barcode)).one[Product]
  def getCookers(barcode: String)(implicit db: DB): Future[Option[CookersProduct]] = collectionCookers().find(Json.obj("barcode" -> barcode)).one[CookersProduct]
  def getOpenFoodFacts(barcode: String)(implicit db: DB): Future[Option[JsValue]] = collectionOpenFoodFacts().find(Json.obj("barcode" -> barcode)).one[JsValue].map(opt => opt.map(doc => doc \ "data"))
  def getPrixing(barcode: String)(implicit db: DB): Future[Option[String]] = collectionPrixing().find(Json.obj("barcode" -> barcode)).one[JsValue].map(opt => opt.map(doc => (doc \ "data").as[String]))

  //def insert(product: Product)(implicit db: DB): Future[LastError] = collection().insert(product)
  def insertCookers(product: CookersProduct)(implicit db: DB): Future[LastError] = collectionCookers().insert(product)
  def insertOpenFoodFacts(barcode: String, product: JsValue)(implicit db: DB): Future[LastError] = collectionOpenFoodFacts().insert(Json.obj("barcode" -> barcode, "data" -> product))
  def insertPrixing(barcode: String, product: String)(implicit db: DB): Future[LastError] = collectionPrixing().insert(Json.obj("barcode" -> barcode, "data" -> product))

  /*def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())*/
}