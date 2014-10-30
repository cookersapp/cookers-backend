package controllers

import common.Mandrill
import common.Validator
import models.User
import dao.UsersDao
import scala.concurrent.Future
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object Users extends Controller with MongoController {
  implicit val DB = db

  // get all users
  def getAll = Action {
    Async {
      UsersDao.all().map { users => Ok(Json.toJson(users)) }
    }
  }

  // get user with id
  def get(id: String) = Action {
    Async {
      UsersDao.findById(id).map {
        case Some(user) => Ok(Json.toJson(user))
        case None => NotFound(Json.obj("message" -> "User not found !"))
      }
    }
  }

  // find user with mail and create if it does not exists
  def findOrCreate(email: String, welcomeEmailSent: Option[Boolean]) = Action {
    Async {
      if (Validator.isEmail(email)) {
        UsersDao.findByEmail(email).flatMap {
          case Some(user) => Future.successful(Ok(Json.toJson(user)))
          case None => {
            val user = new User(email)
            UsersDao.insert(user).map { lastError =>
              lastError.inError match {
                case false => {
                  if (welcomeEmailSent.isEmpty || (welcomeEmailSent.isDefined && !welcomeEmailSent.get)) {
                    Mandrill.sendWelcomeEmail(email)
                  }
                  // TODO : get gravatar profile and update user
                  Created(Json.toJson(user))
                }
                case true => InternalServerError(Json.obj("message" -> lastError.errMsg.getOrElse("").toString()))
              }
            }
          }
        }
      } else {
        Future.successful(BadRequest("invalid email"))
      }
    }
  }

  // update a setting for a user
  // body format : {value: valueOfSetting}
  def setUserSetting(id: String, setting: String) = Action(parse.json) { request =>
    Async {
      val settingValue = request.body \ "value"
      UsersDao.updateSetting(id, setting, settingValue).map { lastError =>
        lastError.inError match {
          case false => Ok
          case true => InternalServerError(Json.obj("message" -> lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  // link a device to a user if not done yet
  def setUserDevice(id: String) = Action(parse.json) { request =>
    Async {
      val device = request.body
      UsersDao.addDevice(id, device).map { lastError =>
        lastError.inError match {
          case false => Ok
          case true => InternalServerError(Json.obj("message" -> lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }
}
