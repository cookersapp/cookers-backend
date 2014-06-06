package controllers.crud

import models.Aliment
import models.AlimentCategory
import dao.AlimentDao
import models.AlimentFormat._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController
import reactivemongo.bson.BSONObjectID
import play.api.data.Form
import play.api.libs.json.Json.toJsFieldJsValueWrapper

object Aliments extends Controller with MongoController {
  implicit val DB = db

  val pageTitle = "Aliments admin"
  val alimentRarityValues = List("basic", "common", "rare")
  val currencyValues = List("euro", "dollar")
  val unitValues = List("unit", "kg", "g", "litre", "cl")
  val alimentForm: Form[Aliment] = Form(Aliment.mapForm)

  def options(categories: Set[AlimentCategory]): Seq[(String, String)] = categories.map(category => (category.name, category.name)).toSeq

  def index = Action.async {
    AlimentDao.findAll().map { aliments =>
      Ok(views.html.admin.crud.aliments.list(pageTitle, aliments.toList))
    }
  }

  def showCreationForm = Action.async {
    AlimentDao.findAllCategories().map { categories =>
      Ok(views.html.admin.crud.aliments.edit(pageTitle, None, alimentForm, options(categories), alimentRarityValues, currencyValues, unitValues))
    }
  }

  def create = Action.async { implicit request =>
    alimentForm.bindFromRequest.fold(
      formWithErrors => AlimentDao.findAllCategories().map { categories =>
        BadRequest(views.html.admin.crud.aliments.edit(pageTitle, None, formWithErrors, options(categories), alimentRarityValues, currencyValues, unitValues))
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
        Ok(views.html.admin.crud.aliments.edit(pageTitle, Some(id), alimentForm.fill(aliment), options(categories), alimentRarityValues, currencyValues, unitValues))
      }.getOrElse(Redirect(routes.Aliments.index()))
    }
  }

  def update(id: String) = Action.async { implicit request =>
    alimentForm.bindFromRequest.fold(
      formWithErrors => AlimentDao.findAllCategories().map { categories =>
        BadRequest(views.html.admin.crud.aliments.edit(pageTitle, Some(id), formWithErrors, options(categories), alimentRarityValues, currencyValues, unitValues))
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