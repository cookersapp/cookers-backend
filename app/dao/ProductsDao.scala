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

object ProductsDao {
  private val COLLECTION_COOKERS = "cookersProducts"
  private val COLLECTION_OPEN_FOOD_FACTS = "importOpenFoodFactsProducts"
  private val COLLECTION_PRIXING = "importPrixingProducts"

  private def collectionCookers()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_COOKERS)
  private def collectionOpenFoodFacts()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_OPEN_FOOD_FACTS)
  private def collectionPrixing()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_PRIXING)

  def getAllCookers()(implicit db: DB): Future[List[CookersProduct]] = collectionCookers().find(Json.obj()).cursor[CookersProduct].toList
  def getCookers(barcode: String)(implicit db: DB): Future[Option[CookersProduct]] = collectionCookers().find(Json.obj("barcode" -> barcode)).one[CookersProduct]
  def insertCookers(product: CookersProduct)(implicit db: DB): Future[LastError] = collectionCookers().insert(product)
  def setFoodId(barcode: String, foodId: String)(implicit db: DB): Future[LastError] = collectionCookers().update(Json.obj("barcode" -> barcode), Json.obj("$set" -> Json.obj("foodId" -> foodId)))

  def getAllOpenFoodFacts()(implicit db: DB): Future[List[OpenFoodFactsProduct]] =
    collectionOpenFoodFacts().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[OpenFoodFactsProduct]).flatten)
  def getOpenFoodFacts(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] =
    collectionOpenFoodFacts().find(Json.obj("key" -> barcode)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[OpenFoodFactsProduct]))
  def saveOpenFoodFacts(barcode: String, product: JsValue, productFormated: OpenFoodFactsProduct)(implicit db: DB): Future[LastError] =
    collectionOpenFoodFacts().update(Json.obj("key" -> barcode), Json.obj(
      "key" -> barcode,
      "saved" -> new Date().getTime(),
      "source" -> product,
      "data" -> productFormated), upsert = true)

  def getPrixingProducts()(implicit db: DB): Future[List[PrixingProduct]] =
    collectionPrixing().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[PrixingProduct]).flatten)
  def getPrixingProduct(barcode: String)(implicit db: DB): Future[Option[PrixingProduct]] =
    collectionPrixing().find(Json.obj("key" -> barcode)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[PrixingProduct]))
  def savePrixingProduct(barcode: String, product: String, productFormated: PrixingProduct)(implicit db: DB): Future[LastError] =
    collectionPrixing().update(Json.obj("key" -> barcode), Json.obj(
      "key" -> barcode,
      "saved" -> new Date().getTime(),
      "source" -> product,
      "data" -> productFormated), upsert = true)

  /*def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())*/
}