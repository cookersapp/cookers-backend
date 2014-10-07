package controllers

import java.io.File

import play.Play
import play.api.mvc.Action
import play.api.mvc.Controller

object Application extends Controller {
  def index(any: String) = Action {
    Ok(views.html.index())
  }

  def corsPreflight(all: String) = Action {
    Ok("").withHeaders("Access-Control-Allow-Origin" -> "*",
      "Allow" -> "*",
      "Access-Control-Allow-Methods" -> "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Origin, X-Requested-With, Content-Type, Accept, Referrer, User-Agent");
  }
}