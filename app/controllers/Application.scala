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
import play.api.libs.json._
import play.modules.reactivemongo.MongoController
import reactivemongo.core.commands.LastError

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
    if (Utils.isProd()) {
      Forbidden(Json.obj("message" -> "Illegal operation in Prod !"))
    } else {
      UsersDao.drop()
      EventsDao.drop()
      MalformedEventsDao.drop()
      Ok(Json.obj("message" -> "success"))
    }
  }

  def export(exportUsers: Option[Boolean], exportEvents: Option[Boolean], exportMalformedEvents: Option[Boolean]) = Action {
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
    /*val removeUnwantedFields = (__ \ '_id).json.prune andThen (__ \ 'a).json.prune
    val json = Json.obj("_id" -> Json.obj(), "a" -> "a", "b" -> Json.obj("ba" -> "ba", "$bb" -> "bb"), "c" -> Json.arr(Json.obj(), Json.obj("$ca" -> "ca", "cb" -> "cb")))
    Ok(json.transform(removeUnwantedFields).get)*/
  }

  // Accept json of 10 Mo
  def importAndMerge = Action(parse.json(maxLength = 1024 * 1024 * 10)) { request =>
    Async {
      if (Utils.isProd()) {
        Future.successful(Forbidden(Json.obj("message" -> "Illegal operation in Prod !")))
      } else {
        val emptyList: List[JsValue] = List()
        val users = (request.body \ "users").asOpt[List[JsValue]].getOrElse(null)
        val events = (request.body \ "events").asOpt[List[JsValue]].getOrElse(null)
        val malformedEvents = (request.body \ "malformedEvents").asOpt[List[JsValue]].getOrElse(null)

        val results: Future[(List[LastError], List[LastError], List[LastError])] = for {
          usersErrors <- UsersDao.importCollection(users)
          eventsErrors <- EventsDao.importCollection(events)
          malformedEventsErrors <- MalformedEventsDao.importCollection(malformedEvents)
        } yield (usersErrors, eventsErrors, malformedEventsErrors)

        results.map {
          case (usersErrors, eventsErrors, malformedEventsErrors) => {
            Ok(Json.obj("message" -> "success"))
          }
        }
      }
    }
  }

  // Accept json of 10 Mo
  def clearAndImport = Action(parse.json(maxLength = 1024 * 1024 * 10)) { request =>
    Async {
      if (Utils.isProd()) {
        Future.successful(Forbidden(Json.obj("message" -> "Illegal operation in Prod !")))
      } else {
        val emptyList: List[JsValue] = List()
        val users = (request.body \ "users").asOpt[List[JsValue]].getOrElse(null)
        val events = (request.body \ "events").asOpt[List[JsValue]].getOrElse(null)
        val malformedEvents = (request.body \ "malformedEvents").asOpt[List[JsValue]].getOrElse(null)

        val dropResults: Future[(Boolean, Boolean, Boolean)] = for {
          usersDrop <- UsersDao.drop()
          eventsDrop <- EventsDao.drop()
          malformedEventsDrop <- MalformedEventsDao.drop()
        } yield (usersDrop, eventsDrop, malformedEventsDrop)

        dropResults.flatMap {
          case (usersDrop, eventsDrop, malformedEventsDrop) => {
            val results: Future[(List[LastError], List[LastError], List[LastError])] = for {
              usersErrors <- UsersDao.importCollection(users)
              eventsErrors <- EventsDao.importCollection(events)
              malformedEventsErrors <- MalformedEventsDao.importCollection(malformedEvents)
            } yield (usersErrors, eventsErrors, malformedEventsErrors)

            results.map {
              case (usersErrors, eventsErrors, malformedEventsErrors) => {
                Ok(Json.obj("message" -> "success"))
              }
            }
          }
        }
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