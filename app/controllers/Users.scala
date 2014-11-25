package controllers

import common.Mandrill
import common.Validator
import common.ApiUtils
import models.User
import dao.UsersDao
import dao.CartsDao
import scala.concurrent.Future
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController

object Users extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      UsersDao.all().map { users => Ok(ApiUtils.Ok(Json.toJson(users))) }
    }
  }

  def get(id: String) = Action {
    Async {
      UsersDao.findById(id).map {
        case Some(user) => Ok(ApiUtils.Ok(user))
        case None => Ok(ApiUtils.NotFound("User not found !"))
      }
    }
  }

  // find user with mail and create if it does not exists
  def findOrCreate(email: String, welcomeEmailSent: Option[Boolean]) = Action {
    Async {
      if (Validator.isEmail(email)) {
        UsersDao.findByEmail(email).flatMap {
          // TODO : can't migrate now because app version 1.1.0 expects result as User :(
          case Some(user) => Future.successful(Ok(Json.toJson(user)))
          case None => {
            val user = new User(email)
            UsersDao.insert(user).map { lastError =>
              lastError.inError match {
                case false => {
                  if (welcomeEmailSent.isEmpty || (welcomeEmailSent.isDefined && !welcomeEmailSent.get)) {
                    Mandrill.sendWelcomeEmail(email)
                  }
                  // TODO : can't migrate now because app version 1.1.0 expects result as User :(
                  // TODO : get user infos with gravatar and https://www.fullcontact.com/
                  Ok(Json.toJson(user))
                }
                case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
              }
            }
          }
        }
      } else {
        Future.successful(Ok(ApiUtils.BadRequest("invalid email")))
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
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  // Add messageId to list of closed messages
  def setMessageClosed(id: String, messageId: String) = Action {
    Async {
      UsersDao.messageClosed(id, messageId).map { lastError =>
        lastError.inError match {
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
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
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }

  def getUserCarts(id: String) = Action {
    Async {
      CartsDao.getCarts(id).map { carts => Ok(ApiUtils.Ok(Json.toJson(carts))) }
    }
  }

  // Save cart when user archive it
  def archiveUserCart(id: String, cartId: String) = Action(parse.json) { request =>
    Async {
      val cart = request.body
      CartsDao.addArchivedCart(id, cartId, cart).map { lastError =>
        lastError.inError match {
          case false => Ok(ApiUtils.Ok)
          case true => InternalServerError(ApiUtils.Error(lastError.errMsg.getOrElse("").toString()))
        }
      }
    }
  }
}
