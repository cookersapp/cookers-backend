package controllers

import scrapers.MarmitonScraper
import common.ApiUtils
import java.util.Date
import scala.collection.mutable.MutableList
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
      val params: MutableList[String] = MutableList()
      if (query.isDefined && query.get.length() > 0) params += "aqt=" + query.get
      if (photoOnly.isDefined && photoOnly.get) params += "pht=1"
      if (vegetarianOnly.isDefined && vegetarianOnly.get) params += "veg=1"
      if (noCooking.isDefined && noCooking.get) params += "rct=1"
      if (category.isDefined && category.get.length() > 0) params += "dt=" + category.get // must be in : entree, platprincipal, dessert, accompagnement, amusegueule, confiserie, sauce
      if (difficulty.isDefined && 0 < difficulty.get && difficulty.get < 5) params += "dif=" + difficulty.get
      if (cost.isDefined && 0 < cost.get && cost.get < 4) params += "exp=" + cost.get
      if (inIngredients.isDefined && inIngredients.get) params += "st=1"
      if (sort.isDefined && sort.get.length() > 0) params += "sort=" + sort.get // must be in : markdesc, popularitydesc (default: pertinence)
      if (start.isDefined && 0 < start.get) params += "start=" + start.get

      if (params.length > 0) {
        val url = "http://www.marmiton.org/recettes/recherche.aspx?" + params.mkString("&")
        val startTime = new Date().getTime()
        MarmitonScraper.search(url, allowSponsored.getOrElse(false)).map { searchOpt =>
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