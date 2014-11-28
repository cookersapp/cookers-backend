package dao

import models.food.dataImport.CookersProduct
import models.food.dataImport.OpenFoodFactsProduct
import models.food.dataImport.PrixingProduct
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._

object ProductsDao {
  // http://www.ewg.org/foodscores/products/799210980027
  // http://www.product-open-data.com/
  // http://www.noteo.info/
  // http://www.shopwise.fr/
  // http://www.mesgouts.fr/
  // http://www.nutritionix.com/api
  // http://www.digit-eyes.com/
  private val COLLECTION_COOKERS = "cookersProducts"
  private val COLLECTION_OPEN_FOOD_FACTS = "importOpenFoodFactsProducts"
  private val COLLECTION_PRIXING = "importPrixingProducts"

  private def collectionCookers()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_COOKERS)
  private def collectionOpenFoodFacts()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_OPEN_FOOD_FACTS)
  private def collectionPrixing()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_PRIXING)

  def getAllCookers()(implicit db: DB): Future[List[CookersProduct]] = collectionCookers().find(Json.obj()).cursor[JsValue].toList.map(_.map(json => json.asOpt[CookersProduct]).flatten)
  def getCookers(barcode: String)(implicit db: DB): Future[Option[CookersProduct]] = collectionCookers().find(Json.obj("barcode" -> barcode)).one[JsValue].map(_.flatMap(_.asOpt[CookersProduct]))
  def upsertCookers(product: CookersProduct)(implicit db: DB): Future[LastError] = collectionCookers().update(Json.obj("barcode" -> product.barcode), product, upsert = true)
  def setFoodId(barcode: String, foodId: String)(implicit db: DB): Future[LastError] = collectionCookers().update(Json.obj("barcode" -> barcode), Json.obj("$set" -> Json.obj("foodId" -> foodId)))
  def scanned(barcode: String, item: String)(implicit db: DB): Future[LastError] = collectionCookers().update(Json.obj("barcode" -> barcode), Json.obj("$inc" -> Json.obj("scans" -> 1, ("scannedWith." + item) -> 1)))

  def getAllOpenFoodFacts()(implicit db: DB): Future[List[OpenFoodFactsProduct]] =
    collectionOpenFoodFacts().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[OpenFoodFactsProduct]).flatten)
  def getOpenFoodFacts(barcode: String)(implicit db: DB): Future[Option[OpenFoodFactsProduct]] =
    collectionOpenFoodFacts().find(Json.obj("key" -> barcode)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[OpenFoodFactsProduct]))
  def saveOpenFoodFacts(barcode: String, product: JsValue, productFormated: OpenFoodFactsProduct)(implicit db: DB): Future[LastError] =
    collectionOpenFoodFacts().update(Json.obj("key" -> barcode), Json.obj(
      "key" -> barcode,
      "saved" -> new Date().getTime(),
      //"source" -> product,
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
      //"source" -> product,
      "data" -> productFormated), upsert = true)

  /*def count()(implicit db: DB): Future[Int] = {
    val bsonQuery: BSONDocument = BSONFormats.toBSON(Json.obj()).get.asInstanceOf[BSONDocument]
    collection().db.command(Count(COLLECTION_NAME, Some(bsonQuery)))
  }
  def drop()(implicit db: DB): Future[Boolean] = DaoUtils.drop(db, collection())*/
}