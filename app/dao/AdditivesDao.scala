package dao

import models.food.dataImport.AdditifAlimentairesAdditive
import models.food.dataImport.PrixingAdditive
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.DB
import reactivemongo.core.commands._

object AdditivesDao {
  /*
   * See also :
   * 500 additifs : http://www.additifs-alimentaires.net/additifs.php
   * 302 additifs : http://www.quechoisir.org/alimentation/securite-hygiene/etude-liste-des-additifs-alimentaires
   * 354 additifs : http://www.avenir-bio.fr/additifs_alimentaires.php
   * 658 additifs : http://fr.wikipedia.org/wiki/Liste_des_additifs_alimentaires
   * 570 additifs : http://fr.wiki.openfoodfacts.org/Liste_des_additifs_reconnus
   * ??? http://www.food-detektiv.de/suche.php ???
   * ~ http://www.danger-sante.org/additifs-alimentaires-nourriture/
   */
  private val COLLECTION_ADDITIF_ALIMENTAIRES = "importAdditifAlimentairesAdditives"
  private val COLLECTION_PRIXING = "importPrixingAdditives"

  private def collectionAdditifAlimentaires()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_ADDITIF_ALIMENTAIRES)
  private def collectionPrixing()(implicit db: DB): JSONCollection = db.collection[JSONCollection](COLLECTION_PRIXING)

  def getAdditifAlimentairesAdditives()(implicit db: DB): Future[List[AdditifAlimentairesAdditive]] =
    collectionAdditifAlimentaires().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[AdditifAlimentairesAdditive]).flatten)
  def getAdditifAlimentairesAdditive(reference: String)(implicit db: DB): Future[Option[AdditifAlimentairesAdditive]] =
    collectionAdditifAlimentaires().find(Json.obj("key" -> reference)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[AdditifAlimentairesAdditive]))
  def saveAdditifAlimentairesAdditive(reference: String, additive: String, additiveFormated: AdditifAlimentairesAdditive)(implicit db: DB): Future[LastError] =
    collectionAdditifAlimentaires().update(Json.obj("key" -> reference), Json.obj(
      "key" -> reference,
      "saved" -> new Date().getTime(),
      //"source" -> additive,
      "data" -> additiveFormated), upsert = true)

  def getPrixingAdditives()(implicit db: DB): Future[List[PrixingAdditive]] =
    collectionPrixing().find(Json.obj()).cursor[JsValue].toList
      .map(opt => opt.map(doc => (doc \ "data").asOpt[PrixingAdditive]).flatten)
  def getPrixingAdditive(reference: String)(implicit db: DB): Future[Option[PrixingAdditive]] =
    collectionPrixing().find(Json.obj("key" -> reference)).one[JsValue].map(opt => opt.flatMap(doc => (doc \ "data").asOpt[PrixingAdditive]))
  def savePrixingAdditive(reference: String, additive: String, additiveFormated: PrixingAdditive)(implicit db: DB): Future[LastError] =
    collectionPrixing().update(Json.obj("key" -> reference), Json.obj(
      "key" -> reference,
      "saved" -> new Date().getTime(),
      //"source" -> additive,
      "data" -> additiveFormated), upsert = true)
}