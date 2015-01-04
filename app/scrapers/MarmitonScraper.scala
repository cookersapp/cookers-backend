package scrapers

import scrapers.marmiton.MarmitonRecipe
import scala.io._
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws._

object MarmitonScraper {
  def scrapeOne(url: String): Future[Option[MarmitonRecipe]] = {
    fetchUrl(url).map { content =>
      val recipeOpt = MarmitonRecipe.create(url, content)
      recipeOpt
    }
  }

  def fetchUrl(url: String): Future[String] = {
    WS.url(url).get().map(response => response.body)
  }
}