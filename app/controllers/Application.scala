package controllers

import common.Mandrill
import common.Utils
import dao.UsersDao
import dao.EventsDao
import dao.MalformedEventsDao
import scala.concurrent._
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Logger
import play.api.mvc.Action
import play.api.mvc.Controller
import play.api.libs.json.Json
import play.api.libs.json.JsValue
import play.modules.reactivemongo.MongoController

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

  def export(exportUsers: Option[Boolean], exportEvents: Option[Boolean], exportMalformedEvents: Option[Boolean]) = Action {
    Logger.debug("export data")
    Async {
      val results: Future[(List[JsValue], List[JsValue], List[JsValue])] = for {
        users <- if (exportUsers.isEmpty || exportUsers.get) UsersDao.export() else Future.successful(List())
        events <- if (exportEvents.isEmpty || exportEvents.get) EventsDao.export() else Future.successful(List())
        malformedEvents <- if (exportMalformedEvents.isEmpty || exportMalformedEvents.get) MalformedEventsDao.export() else Future.successful(List())
      } yield (users, events, malformedEvents)

      results.map {
        case (users, events, malformedEvents) =>
          Ok(Json.obj("users" -> users, "events" -> events, "malformedEvents" -> malformedEvents))
      }
    }
  }

  def importAndMerge = Action(parse.json) { request =>
    Async {
      val emptyList: List[JsValue] = List()
      val users = (request.body \ "users").asOpt[List[JsValue]].getOrElse(emptyList)
      UsersDao.importCollection(users).map { lastErrors =>
        Ok
      }
    }
  }

  def clearAndImport = Action {
    Ok
  }

  def corsPreflight(all: String) = Action {
    Ok("").withHeaders("Access-Control-Allow-Origin" -> "*",
      "Allow" -> "*",
      "Access-Control-Allow-Methods" -> "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" -> "Origin, X-Requested-With, Content-Type, Accept, Referrer, User-Agent");
  }
}