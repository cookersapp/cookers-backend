package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.data.validation.Constraints._

object Admin extends Controller {
  def index = Action {
    Ok(views.html.admin.index())
  }
}