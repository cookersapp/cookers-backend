package controllers

import models.Aliment
import models.AlimentRarity
import models.AlimentDao
import models.AlimentJsonFormat._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController
import reactivemongo.bson.BSONObjectID

object Aliments extends Controller with MongoController {
  val pageTitle = "Aliments admin"
  implicit val DB = db
  def toOptions(values: List[String]): Seq[(String, String)] = {
    values.map(value => (value, value))
  }

  def index = Action.async {
    AlimentDao.findAll().map { aliments =>
      Ok(views.html.admin.aliments.list(pageTitle, aliments.toList))
    }
  }

  def showCreationForm = Action.async {
    Future.successful(Ok(views.html.admin.aliments.edit(pageTitle, None, Aliment.form, toOptions(AlimentRarity.strValues))))
  }

  def create = Action.async { implicit request =>
    Aliment.form.bindFromRequest.fold(
      formWithErrors => Future.successful(BadRequest(views.html.admin.aliments.edit(pageTitle, None, formWithErrors, toOptions(AlimentRarity.strValues)))),
      aliment => {
        AlimentDao.create(aliment).map { lastError => Redirect(routes.Aliments.index()) }
      })
  }

  def showEditForm(id: String) = Action.async {
    AlimentDao.find(id).map { mayBeAliment =>
      mayBeAliment
        .map { aliment => Ok(views.html.admin.aliments.edit(pageTitle, Some(id), Aliment.form.fill(aliment), toOptions(AlimentRarity.strValues))) }
        .getOrElse(Redirect(routes.Aliments.index()))
    }
  }

  def update(id: String) = Action.async { implicit request =>
    Aliment.form.bindFromRequest.fold(
      formWithErrors => Future.successful(BadRequest(views.html.admin.aliments.edit(pageTitle, Some(id), formWithErrors, toOptions(AlimentRarity.strValues)))),
      aliment => {
        AlimentDao.update(id, aliment)
          .map { _ => Redirect(routes.Aliments.index()) }
          .recover { case _ => InternalServerError }
      })
  }

  def delete(id: String) = Action.async {
    println("remove("+id+")");
    AlimentDao.delete(id)
      .map { _ => Redirect(routes.Aliments.index()) }
      .recover { case _ => InternalServerError }
  }

  def apiCreate = Action.async(parse.json) { request =>
    val id = BSONObjectID.generate.stringify
    val aliment = request.body.as[JsObject] ++ Json.obj("id" -> id)
    aliment.validate[Aliment].map {
      AlimentDao.create(_)
        .map { lastError => Created(Json.obj("id" -> id, "msg" -> "Aliment Created")) }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def apiFindAll = Action.async { AlimentDao.findAll().map { aliments => Ok(Json.toJson(aliments)) } }

  def apiFind(id: String) = Action.async {
    AlimentDao.find(id).map { mayBeAliment =>
      mayBeAliment
        .map { aliment => Ok(Json.toJson(aliment)) }
        .getOrElse(NotFound(Json.obj("msg" -> s"Aliment with ID $id not found")))
    }
  }

  def apiUpdate(id: String) = Action.async(parse.json) { request =>
    val aliment = request.body.as[JsObject]
    aliment.validate[Aliment].map {
      AlimentDao.update(id, _)
        .map { _ => Ok(Json.obj("msg" -> s"Aliment Updated")) }
        .recover { case _ => InternalServerError }
    }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def apiDelete(id: String) = Action.async {
    AlimentDao.delete(id)
      .map { _ => Ok(Json.obj("msg" -> s"Aliment Deleted")) }
      .recover { case _ => InternalServerError }
  }
}