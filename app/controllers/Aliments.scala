package controllers

import models.Aliment
import models.AlimentRarity
import models.AlimentCategory
import dao.AlimentDao
import models.AlimentFormat._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController
import reactivemongo.bson.BSONObjectID

object Aliments extends Controller with MongoController {
  val pageTitle = "Aliments admin"
  implicit val DB = db

  def options(values: List[String]): Seq[(String, String)] = values.map(value => (value, value))
  def options(categories: Set[AlimentCategory]): Seq[(String, String)] = categories.map(category => (category.name, category.name)).toSeq

  def index = Action.async {
    AlimentDao.findAll().map { aliments =>
      Ok(views.html.admin.aliments.list(pageTitle, aliments.toList))
    }
  }

  def showCreationForm = Action.async {
    AlimentDao.findAllCategories().map { categories =>
      Ok(views.html.admin.aliments.edit(pageTitle, None, Aliment.form, options(AlimentRarity.strValues), options(categories)))
    }
  }

  def create = Action.async { implicit request =>
    Aliment.form.bindFromRequest.fold(
      formWithErrors => AlimentDao.findAllCategories().map { categories =>
        BadRequest(views.html.admin.aliments.edit(pageTitle, None, formWithErrors, options(AlimentRarity.strValues), options(categories)))
      },
      aliment => AlimentDao.create(aliment).map { lastError => Redirect(routes.Aliments.index()) })
  }

  def showEditForm(id: String) = Action.async {
    val futureResults = for {
      mayBeAliment <- AlimentDao.find(id)
      categories <- AlimentDao.findAllCategories()
    } yield (mayBeAliment, categories)

    futureResults.map { results =>
      results._1.map { aliment =>
        val categories = results._2
        Ok(views.html.admin.aliments.edit(pageTitle, Some(id), Aliment.form.fill(aliment), options(AlimentRarity.strValues), options(categories)))
      }.getOrElse(Redirect(routes.Aliments.index()))
    }
  }

  def update(id: String) = Action.async { implicit request =>
    Aliment.form.bindFromRequest.fold(
      formWithErrors => AlimentDao.findAllCategories().map { categories =>
        BadRequest(views.html.admin.aliments.edit(pageTitle, Some(id), formWithErrors, options(AlimentRarity.strValues), options(categories)))
      },
      aliment => {
        AlimentDao.update(id, aliment)
          .map { _ => Redirect(routes.Aliments.index()) }
          .recover { case _ => InternalServerError }
      })
  }

  def delete(id: String) = Action.async {
    println("remove(" + id + ")");
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