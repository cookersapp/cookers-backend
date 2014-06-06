package controllers.crud

import play.api.mvc._

object CrudMain extends Controller {
  def index = Action {
    Ok(views.html.admin.crud.index())
  }
}