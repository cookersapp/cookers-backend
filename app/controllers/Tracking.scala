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
import play.api.libs.json.JsValue

object Tracking extends Controller with MongoController {
  def eventsCollection: JSONCollection = db.collection[JSONCollection]("events")
  def malformedEventsCollection: JSONCollection = db.collection[JSONCollection]("malformedEvents")
  def usersCollection: JSONCollection = db.collection[JSONCollection]("users")

  // get all events
  def getAll = Action { implicit request =>
    Async {
      val cursor = eventsCollection.find(Json.obj()).sort(Json.obj("time" -> -1)).cursor[Event] // get all the fields of all the events
      val futureList = cursor.toList // convert it to a list of Event
      futureList.map { events => Ok(Json.toJson(events)) } // convert it to a JSON and return it
    }
  }

  // get all malformed events
  def getAllMalformed = Action { implicit request =>
    Async {
      val cursor = malformedEventsCollection.find(Json.obj()).cursor[JsValue]
      val futureList = cursor.toList
      futureList.map { events => Ok(Json.toJson(events)) }
    }
  }

  // save an event
  // fire and forget endpoint...
  def add = Action(parse.json) { request =>
    // Logger.info("track event: " + request.body)
    request.body.validate[Event].map { event => saveEvent(event) }.getOrElse {
      malformedEventsCollection.insert(request.body)
    }
    Ok
  }

  // save an array of events
  // fire and forget endpoint...
  def addAll = Action(parse.json) { request =>
    // Logger.info("track events: " + request.body)
    request.body.validate[Array[Event]].map { events =>
      events.map { event => saveEvent(event) }
    }.getOrElse {
      malformedEventsCollection.insert(request.body)
    }
    Ok
  }

  def saveEvent(event: Event) {
    eventsCollection.insert(event).map { lastError =>
      val selector = Json.obj("id" -> event.userId)
      val update = Json.obj("$set" -> Json.obj("lastSeen" -> event.time))
      usersCollection.update(selector, update)
      // TODO : update appVersion
    }
  }
}