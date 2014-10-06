package controllers

import java.io.File

import play.Play
import play.api.mvc.Action
import play.api.mvc.Controller

object Application extends Controller {
  def index(any: String) = Action {
    Ok(views.html.index())
  }
}