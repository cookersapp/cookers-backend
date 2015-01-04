package controllers

import scrapers.MarmitonScraper
import java.util.Date
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
}