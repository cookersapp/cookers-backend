package services

import dao.AdditivesDao
import models.food.Additive
import models.food.dataImport.AdditifAlimentairesAdditive
import models.food.dataImport.PrixingAdditive
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

object AdditiveSrv {
  def getAllAdditives()(implicit db: DB): Future[List[Additive]] = {
    AdditivesDao.getAdditifAlimentairesAdditives().flatMap { additives =>
      val results = additives.map { additive =>
        AdditivesDao.getPrixingAdditive(additive.reference).map { prixing => Additive.mergeSources(Some(additive), prixing) }
      }
      Future.sequence(results).map(d => d.flatten)
    }
  }

  def getAdditive(reference: String)(implicit db: DB): Future[Option[Additive]] = {
    val future: Future[(Option[AdditifAlimentairesAdditive], Option[PrixingAdditive])] = for {
      additifalimentaires <- getAdditifAlimentairesAdditive(reference)
      prixing <- getPrixingAdditive(reference)
    } yield (additifalimentaires, prixing)

    future.map { case (additifalimentaires, prixing) => Additive.mergeSources(additifalimentaires, prixing) }
  }

  def getAllPrixingAdditives()(implicit db: DB): Future[List[PrixingAdditive]] = AdditivesDao.getPrixingAdditives()
  def getPrixingAdditive(reference: String)(implicit db: DB): Future[Option[PrixingAdditive]] = AdditivesDao.getPrixingAdditive(reference)

  def getAllAdditifAlimentairesAdditive()(implicit db: DB): Future[List[AdditifAlimentairesAdditive]] = AdditivesDao.getAdditifAlimentairesAdditives()
  def getAdditifAlimentairesAdditive(reference: String)(implicit db: DB): Future[Option[AdditifAlimentairesAdditive]] = {
    AdditivesDao.getAdditifAlimentairesAdditive(reference).flatMap { opt =>
      if (opt.isDefined && opt.get.isValid) {
        Future.successful(opt)
      } else {
        WS.url(AdditifAlimentairesAdditive.getSearchUrl(reference)).get().flatMap { response =>
          AdditifAlimentairesAdditive.getIdFromSearch(reference, response.body).map { id =>
            WS.url(AdditifAlimentairesAdditive.getUrl(id)).get().map { response =>
              val content = new String(response.body.getBytes("ISO-8859-1"), "UTF-8")
              AdditifAlimentairesAdditive.create(id, content).map { additiveFormated =>
                AdditivesDao.saveAdditifAlimentairesAdditive(reference, content, additiveFormated)
                additiveFormated
              }
            }
          }.getOrElse(Future.successful(None))
        }
      }
    }
  }
}