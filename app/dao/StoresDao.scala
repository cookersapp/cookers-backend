package dao

import models.Store
import models.StoreProduct
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.modules.reactivemongo.json.BSONFormats
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._

object StoresDao {
  private val COLLECTION_NAME = "stores"
  private val COLLECTION_NAME_PRODUCTS = "storeProducts"

  private def collection()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME)
  private def collectionProducts()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_NAME_PRODUCTS)

  def all()(implicit db: DB): Future[List[Store]] = collection().find(Json.obj()).cursor[Store].toList
  def find(id: String)(implicit db: DB): Future[Option[Store]] = collection().find(Json.obj("id" -> id)).one[Store]
  def insert(store: Store)(implicit db: DB): Future[LastError] = collection().insert(store)
  def update(id: String, store: Store)(implicit db: DB): Future[LastError] = collection().update(Json.obj("id" -> id), store)
  def remove(id: String)(implicit db: DB): Future[LastError] = collection().remove(Json.obj("id" -> id))

  def allProducts(store: String)(implicit db: DB): Future[List[StoreProduct]] = collectionProducts().find(Json.obj("store" -> store)).cursor[StoreProduct].toList
  def findProduct(store: String, product: String)(implicit db: DB): Future[Option[StoreProduct]] = collectionProducts().find(Json.obj("store" -> store, "product" -> product)).one[StoreProduct]
  def insertProduct(storeProduct: StoreProduct)(implicit db: DB): Future[LastError] = collectionProducts().insert(storeProduct)
  def updateProduct(store: String, product: String, storeProduct: StoreProduct)(implicit db: DB): Future[LastError] = collectionProducts().update(Json.obj("store" -> store, "product" -> product), storeProduct)
  def removeProduct(store: String, product: String)(implicit db: DB): Future[LastError] = collectionProducts().remove(Json.obj("store" -> store, "product" -> product))
}