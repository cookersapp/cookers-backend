package controllers

import models.Event
import models.Event._

import play.api.mvc.Action
import play.api.mvc.Controller
import play.api.libs.json.Json
import play.api.Logger

import reactivemongo.api._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import scala.concurrent.Future

object Tracking extends Controller with MongoController {
  def eventsCollection: JSONCollection = db.collection[JSONCollection]("events")

  def add = Action(parse.json) { request =>
    // Logger.info("request: " + request.body)
    Async {
      request.body.validate[Event].map { event =>
        eventsCollection.insert(event).map { lastError =>
          // Logger.debug(s"Successfully inserted with LastError: $lastError")
          Created
        }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
    }
  }

  def addAll = Action(parse.json) { request =>
    // TODO : add an array of events
    Ok
  }

  def getAll = Action { implicit request =>
    Async {
      val cursor = eventsCollection.find(Json.obj()).cursor[Event] // get all the fields of all the events
      val futureList = cursor.toList // convert it to a list of Event
      futureList.map { events => Ok(Json.toJson(events)) } // convert it to a JSON and return it
    }
  }
}