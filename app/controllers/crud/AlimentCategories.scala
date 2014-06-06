package controllers.crud

import models.Aliment
import models.AlimentCategory
import models.Constants
import dao.AlimentCategoryDao
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.mvc._
import play.api.libs.json._
import play.api.data.Form
import play.modules.reactivemongo.MongoController


object AlimentCategories extends Controller with MongoController {
  implicit val DB = db
  
  val pageTitle = "Aliment categories admin"
  val categoryForm: Form[AlimentCategory] = Form(AlimentCategory.mapForm)

  def options(categories: Set[AlimentCategory]): Seq[(String, String)] = categories.map(category => (category.name, category.name)).toSeq
    
  def index = Action.async {
    AlimentCategoryDao.findAll().map { categories =>
      Ok(views.html.admin.crud.alimentcategories.list(pageTitle, categories.toList))
    }
  }

  def showCreationForm = Action.async {
	  Future.successful(Ok(views.html.admin.crud.alimentcategories.edit(pageTitle, None, categoryForm)))
  }

  def create = Action.async { implicit request =>
    categoryForm.bindFromRequest.fold(
      formWithErrors => Future.successful(BadRequest(views.html.admin.crud.alimentcategories.edit(pageTitle, None, formWithErrors))),
      category => AlimentCategoryDao.create(category).map { lastError => Redirect(routes.AlimentCategories.index()) })
  }

  def showEditForm(id: String) = Action.async {
    val futureResults = for {
      mayBeCategory <- AlimentCategoryDao.find(id)
    } yield mayBeCategory

    futureResults.map { mayBeCategory =>
      mayBeCategory.map { category =>
        Ok(views.html.admin.crud.alimentcategories.edit(pageTitle, Some(id), categoryForm.fill(category)))
      }.getOrElse(Redirect(routes.AlimentCategories.index()))
    }
  }

  def update(id: String) = Action.async { implicit request =>
    categoryForm.bindFromRequest.fold(
      formWithErrors => Future.successful(BadRequest(views.html.admin.crud.alimentcategories.edit(pageTitle, Some(id), formWithErrors))),
      category => {
        AlimentCategoryDao.update(id, category)
          .map { _ => Redirect(routes.AlimentCategories.index()) }
          .recover { case _ => InternalServerError }
      })
  }

  def delete(id: String) = Action.async {
    println("remove(" + id + ")");
    AlimentCategoryDao.delete(id)
      .map { _ => Redirect(routes.Aliments.index()) }
      .recover { case _ => InternalServerError }
  }
}