package controllers

import common.ApiUtils
import models.Event
import models.Event.eventFormat
import dao.EventsDao
import dao.MalformedEventsDao
import dao.UsersDao
import services.EventSrv
import scala.concurrent._
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object Tracking extends Controller with MongoController {
  implicit val DB = db

  def getAll(name: Option[String]) = Action {
    Async {
      val results: Future[List[Event]] = if (name.isEmpty) EventsDao.all() else EventsDao.findByName(name.get)
      results.map { events => Ok(ApiUtils.Ok(Json.toJson(events))) }
    }
  }

  def getAllMalformed = Action {
    Async {
      MalformedEventsDao.all().map { events => Ok(ApiUtils.Ok(Json.toJson(events))) }
    }
  }

  def get(id: String) = Action {
    Async {
      val result: Future[Option[Event]] = EventsDao.findById(id)
      result.map { eventOpt =>
        if (eventOpt.isEmpty) Ok(ApiUtils.NotFound("Event not found !"))
        else Ok(ApiUtils.Ok(eventOpt.get))
      }
    }
  }

  def getForUser(id: String) = Action {
    Async {
      EventsDao.findByUser(id).map { events => Ok(ApiUtils.Ok(Json.toJson(events))) }
    }
  }

  // save an event
  // fire and forget endpoint...
  def add = Action(parse.json) { request =>
    request.body.validate[Event].map { event =>
      EventsDao.insert(event).map { lastError =>
        EventSrv.aggregateData(event)
      }
    }.getOrElse {
      MalformedEventsDao.insert(request.body)
    }
    Ok(ApiUtils.Ok)
  }

  // save an array of events
  // fire and forget endpoint...
  def addAll = Action(parse.json) { request =>
    request.body.validate[Array[Event]].map { events =>
      events.map { event =>
        EventsDao.insert(event).map { lastError =>
          EventSrv.aggregateData(event)
        }
      }
    }.getOrElse {
      MalformedEventsDao.insert(request.body)
    }
    Ok(ApiUtils.Ok)
  }
}