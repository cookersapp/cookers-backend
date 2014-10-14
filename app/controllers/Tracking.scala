package controllers

import scala.Array.canBuildFrom

import dao.EventsDao
import dao.MalformedEventsDao
import dao.UsersDao
import models.Event
import models.Event.eventFormat
import scala.concurrent._
import play.api.libs.json.Json
import play.api.mvc.Action
import play.api.mvc.Controller
import play.modules.reactivemongo.MongoController

object Tracking extends Controller with MongoController {
  implicit val DB = db

  // get all events
  def getAll(name: Option[String]) = Action {
    Async {
      val results: Future[List[Event]] = if (name.isEmpty) EventsDao.all() else EventsDao.findByName(name.get)
      results.map { events => Ok(Json.toJson(events)) }
    }
  }

  // get all malformed events
  def getAllMalformed = Action {
    Async {
      MalformedEventsDao.all().map { events => Ok(Json.toJson(events)) }
    }
  }

  // get event
  def get(id: String) = Action {
    Async {
      val result: Future[Option[Event]] = EventsDao.findById(id)
      result.map { eventOpt => if (eventOpt.isEmpty) NotFound else Ok(Json.toJson(eventOpt.get)) }
    }
  }

  def getForUser(id: String) = Action {
    Async {
      EventsDao.findByUser(id).map { events => Ok(Json.toJson(events)) }
    }
  }

  // save an event
  // fire and forget endpoint...
  def add = Action(parse.json) { request =>
    // Logger.info("track event: " + request.body)
    request.body.validate[Event].map { event =>
      EventsDao.insert(event).map { lastError =>
        UsersDao.lastSeen(event.user)
        // TODO : update appVersion
      }
    }.getOrElse {
      MalformedEventsDao.insert(request.body)
    }
    Ok
  }

  // save an array of events
  // fire and forget endpoint...
  def addAll = Action(parse.json) { request =>
    // Logger.info("track events: " + request.body)
    request.body.validate[Array[Event]].map { events =>
      events.map { event =>
        EventsDao.insert(event).map { lastError =>
          UsersDao.lastSeen(event.user)
          // TODO : update appVersion
        }
      }
    }.getOrElse {
      MalformedEventsDao.insert(request.body)
    }
    Ok
  }
}