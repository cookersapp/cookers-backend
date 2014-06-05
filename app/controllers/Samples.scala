package controllers

import play.api.mvc._

object Samples extends Controller {
  def index = Action {
    Ok(views.html.samples.index())
  }
}