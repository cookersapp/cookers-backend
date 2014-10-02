package controllers

import java.io.File

import play.Play
import play.api.mvc.Action
import play.api.mvc.Controller
import play.api.Logger

object Application extends Controller {
  /** serve the index page app/views/index.scala.html */
  def index(any: String) = Action {
    Ok(views.html.index())
  }

  /** load an HTML page from public/views */
  def loadPublicHTML(any: String) = Action {
    val uri = Play.application().path() + "/public/views/" + any
    var file = new File(uri)
    if (file.exists())
      Ok(scala.io.Source.fromFile(file.getCanonicalPath()).mkString).as("text/html");
    else
      NotFound
  }
}