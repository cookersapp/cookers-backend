package controllers

import common.Mandrill

import scala.concurrent._
import ExecutionContext.Implicits.global

import play.api.Play
import play.api.mvc._
import play.api.Logger

object Application extends Controller {
  def index(any: String) = Action {
    val env = Play.current.configuration.getString("application.env")
    Ok(views.html.index(env.get))
  }

  def sendFeedback = Action(parse.json) { request =>
    val from = (request.body \ "from").as[String]
    val content = (request.body \ "content").as[String]
    val source = (request.body \ "source").as[String]
    Async {
      Mandrill.sendFeedback(from, content, source).map { status =>
        Ok(status)
      }
    }
  }

  def corsPreflight(all: String) = Action {
    Ok("").withHeaders("Access-Control-Allow-Origin" -> "*",
      "Allow" -> "*",
      "Access-Control-Allow-Methods" -> "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Origin, X-Requested-With, Content-Type, Accept, Referrer, User-Agent");
  }
}