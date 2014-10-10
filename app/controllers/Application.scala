package controllers

import scala.concurrent.ExecutionContext.Implicits.global
import common.Mandrill
import common.Utils
import play.api.mvc.Action
import play.api.mvc.Controller
import dao.UsersDao
import play.modules.reactivemongo.MongoController
import dao.EventsDao
import dao.MalformedEventsDao

object Application extends Controller with MongoController {
  implicit val DB = db

  def index(any: String) = Action {
    Ok(views.html.index(Utils.getEnv()))
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

  def resetDatabase = Action {
    UsersDao.drop()
    EventsDao.drop()
    MalformedEventsDao.drop()
    Ok
  }

  def corsPreflight(all: String) = Action {
    Ok("").withHeaders("Access-Control-Allow-Origin" -> "*",
      "Allow" -> "*",
      "Access-Control-Allow-Methods" -> "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Origin, X-Requested-With, Content-Type, Accept, Referrer, User-Agent");
  }
}