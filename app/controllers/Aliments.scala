package controllers

import models.Aliment
import models.AlimentDao
import models.AlimentJsonFormat._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController
import reactivemongo.bson.BSONObjectID

object Aliments extends Controller with MongoController {
  implicit val DB = db

  def create = Action.async(parse.json) { request =>
    val id = BSONObjectID.generate.stringify
    val aliment = request.body.as[JsObject] ++ Json.obj("id" -> id)
    aliment.validate[Aliment].map {
      AlimentDao.create(_)
        .map { lastError => Created(Json.obj("id" -> id, "msg" -> "Aliment Created")) }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def findAll = Action.async { AlimentDao.findAll().map { aliments => Ok(Json.toJson(aliments)) } }

  def find(id: String) = Action.async {
    AlimentDao.find(id).map { mayBeAliment =>
      mayBeAliment
        .map { aliment => Ok(Json.toJson(aliment)) }
        .getOrElse(NotFound(Json.obj("msg" -> s"Aliment with ID $id not found")))
    }
  }

  def update(id: String) = Action.async(parse.json) { request =>
    val aliment = request.body.as[JsObject]
    aliment.validate[Aliment].map {
      AlimentDao.update(id, _)
        .map { _ => Ok(Json.obj("msg" -> s"Aliment Updated")) }
        .recover { case _ => InternalServerError }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def delete(id: String) = Action.async {
    AlimentDao.delete(id)
      .map { _ => Ok(Json.obj("msg" -> s"Aliment Deleted")) }
      .recover { case _ => InternalServerError }
  }
}