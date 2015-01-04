package scrapers

import scrapers.marmiton.MarmitonRecipe
import scrapers.marmiton.MarmitonSearch
import scala.io._
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws._

// TODO : charger toutes les photos quand on charge une recette
// TODO : charger tous les commentaires quand on charge une recette
// TODO : sauver les recettes en base (et les récupérer en base si elles existent)
//	http://www.marmiton.org/recettes/recette_ramequins-fondants-au-chocolat_15816.aspx
//	http://www.marmiton.org/recettes/recette-photo_ramequins-fondants-au-chocolat_15816.aspx
//	http://www.marmiton.org/recettes/recette-avis_ramequins-fondants-au-chocolat_15816.aspx

object MarmitonScraper {
  def scrapeOne(url: String): Future[Option[MarmitonRecipe]] = {
    fetchUrl(url).map { content =>
      val recipeOpt = MarmitonRecipe.create(url, content)
      recipeOpt
    }
  }

  def search(url: String, allowSponsored: Boolean) = {
    fetchUrl(url).map { content =>
      val searchOpt = MarmitonSearch.create(url, content, allowSponsored)
      searchOpt
    }
  }

  def fetchUrl(url: String): Future[String] = {
    WS.url(url).get().map(response => response.body)
  }
}