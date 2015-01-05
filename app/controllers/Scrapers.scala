package controllers

import common.ApiUtils
import scrapers.MarmitonScraper
import scrapers.marmiton.models.MarmitonSearch
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.mvc._
import play.api.Logger
import play.modules.reactivemongo.MongoController

object Scrapers extends Controller with MongoController {
  implicit val DB = db

  def getMarmitonRecipe(url: String) = Action {
    Async {
      val startTime = new Date().getTime()
      MarmitonScraper.scrapeOne(url).map { recipeOpt =>
        Ok(Json.obj(
          "status" -> 200,
          "execMs" -> (new Date().getTime() - startTime),
          "data" -> recipeOpt))
      }
    }
  }

  def marmitonSearch(query: Option[String], photoOnly: Option[Boolean], vegetarianOnly: Option[Boolean], noCooking: Option[Boolean], category: Option[String], difficulty: Option[Int],
    cost: Option[Int], inIngredients: Option[Boolean], allowSponsored: Option[Boolean], sort: Option[String], start: Option[Int]) = Action {
    Async {
      val url = MarmitonSearch.getUrl(query, photoOnly, vegetarianOnly, noCooking, category, difficulty, cost, inIngredients, allowSponsored, sort, start)
      if (url.isDefined) {
        val startTime = new Date().getTime()
        MarmitonScraper.search(url.get, allowSponsored.getOrElse(false)).map { searchOpt =>
          Ok(Json.obj(
            "status" -> 200,
            "execMs" -> (new Date().getTime() - startTime),
            "data" -> searchOpt))
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed query !")))
      }
    }
  }
}