package scrapers

import scrapers.marmiton.MarmitonDao
import scrapers.marmiton.models.MarmitonRecipe
import scrapers.marmiton.models.MarmitonSearch
import scala.io._
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws._
import play.api.Logger
import reactivemongo.api.DB

// TODO : charger toutes les photos quand on charge une recette
// TODO : charger tous les commentaires quand on charge une recette
//	http://www.marmiton.org/recettes/recette_ramequins-fondants-au-chocolat_15816.aspx
//	http://www.marmiton.org/recettes/recette-photo_ramequins-fondants-au-chocolat_15816.aspx
//	http://www.marmiton.org/recettes/recette-avis_ramequins-fondants-au-chocolat_15816.aspx

object MarmitonScraper {
  def scrapeOne(url: String)(implicit db: DB): Future[Option[MarmitonRecipe]] = {
    val cached = MarmitonDao.findByUrl(url)
    cached.flatMap { cacheOpt =>
      if (cacheOpt.isDefined) {
        Future.successful(cacheOpt)
      } else {
        Logger.info("FETCH: " + url)
        fetchUrl(url).map {
          _.flatMap { content =>
            MarmitonRecipe.create(url, content).map { scraped => MarmitonDao.upsert(scraped); scraped }
          }
        }
      }
    }
  }

  def search(url: String, allowSponsored: Boolean): Future[Option[MarmitonSearch]] = {
    fetchUrl(url).map {
      _.flatMap { content =>
        MarmitonSearch.create(url, content, allowSponsored)
      }
    }
  }

  def fetchUrl(url: String): Future[Option[String]] = {
    WS.url(url).get().map(response => Some(response.body)).recover {
      case e: Exception => Logger.error("catched " + e.getClass().getName() + ": " + e.getMessage()); None
    }
  }
}