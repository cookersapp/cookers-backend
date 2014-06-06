package controllers

import models.Aliment
import models.AlimentFormat._
import dao.AlimentDao
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController

object Operations extends Controller with MongoController {
  implicit val DB = db

  def exportDB = Action.async {
    val futureResults = for {
      aliments <- AlimentDao.findAll()
    } yield Json.obj(
      "aliments" -> aliments)

    futureResults.map { results =>
      Ok(Json.toJson(results))
    }
  }

  def importDB = Action.async(parse.json) { request =>
    val newDB = request.body.as[JsObject]
    val aliments = (newDB \ "aliments").as[List[Aliment]]

    val deleteResults = for {
      alimentDeleteError <- AlimentDao.deleteAll()
    } yield (alimentDeleteError)

    deleteResults flatMap { _ =>
      for {
        alimentInsertError <- AlimentDao.insertAll(aliments)
      } yield (alimentInsertError)
    } map { _ =>
      Ok
    }
  }
}