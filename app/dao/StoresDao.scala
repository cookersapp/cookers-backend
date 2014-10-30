package dao

import models.Store
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
  def findById(id: String)(implicit db: DB): Future[Option[Store]] = collection().find(Json.obj("id" -> id)).one[Store]
  
  def insert(store: Store)(implicit db: DB): Future[LastError] = collection().insert(store)
}