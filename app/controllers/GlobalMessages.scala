package controllers

import common.Utils
import common.ApiUtils
import models.GlobalMessage
import dao.GlobalMessagesDao
import scala.concurrent.Future
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object GlobalMessages extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      GlobalMessagesDao.all().map { messages => Ok(ApiUtils.Ok(Json.toJson(messages))) }
    }
  }

  def get(id: String) = Action {
    Async {
      GlobalMessagesDao.findById(id).map {
        case Some(message) => Ok(ApiUtils.Ok(message))
        case None => Ok(ApiUtils.NotFound("GlobalMessage not found !"))
      }
    }
  }

  def create = Action(parse.json) { request =>
    Async {
      val message = Utils.addId(request.body).asOpt[GlobalMessage]
      if (message.isDefined) {
        GlobalMessagesDao.insert(message.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(message.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed GlobalMessage !")))
      }
    }
  }

  def update(id: String) = Action(parse.json) { request =>
    Async {
      val message = request.body.asOpt[GlobalMessage]
      if (message.isDefined) {
        GlobalMessagesDao.update(id, message.get).map { lastError =>
          lastError.inError match {
            case false => Ok(ApiUtils.Ok(message.get))
            case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("Malformed GlobalMessage !")))
      }
    }
  }

  def remove(id: String) = Action {
    Async {
      GlobalMessagesDao.remove(id).map { lastError =>
        lastError.inError match {
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }
}
