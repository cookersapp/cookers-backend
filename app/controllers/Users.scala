package controllers

import models.User
import models.User._
import common.Validator
import common.Mandrill

import play.api.mvc._
import play.api.libs.json._
import play.api.Logger
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

object Users extends Controller with MongoController {
  def usersCollection: JSONCollection = db.collection[JSONCollection]("users")

  // get all users
  def getAll = Action { implicit request =>
    Async {
      val cursor = usersCollection.find(Json.obj()).sort(Json.obj("lastSeen" -> -1)).cursor[User]
      val futureList = cursor.toList
      futureList.map { users => Ok(Json.toJson(users)) }
    }
  }

  // get user with id
  def get(id: String) = Action { request =>
    Async {
      usersCollection.find(Json.obj("id" -> id)).one[User].map { maybeUser =>
        maybeUser.map { user =>
          Ok(Json.toJson(user))
        }.getOrElse {
          NotFound
        }
      }
    }
  }

  // get user with mail and create if it does not exists
  def getOrCreate(email: String, welcomeEmailSent: Option[Boolean]) = Action { request =>
    if (Validator.isEmail(email)) {
      Async {
        usersCollection.find(Json.obj("email" -> email)).one[User].map { maybeUser =>
          maybeUser.map { user =>
            Ok(Json.toJson(user))
          }.getOrElse {
            val user = new User(email)
            usersCollection.insert(user)
            if (welcomeEmailSent.isEmpty || (welcomeEmailSent.isDefined && !welcomeEmailSent.get)) {
              Mandrill.sendWelcomeEmail("loicknuchel@gmail.com")
            }
            Created(Json.toJson(user))
          }
        }
      }
    } else {
      BadRequest("invalid email")
    }
  }

  // update a setting for a user
  // body format : {value: valueOfSetting}
  def setUserSetting(id: String, setting: String) = Action(parse.json) { request =>
    val settingValue = request.body \ "value"
    val selector = Json.obj("id" -> id)
    val update = Json.obj("$set" -> Json.obj("settings." + setting -> settingValue))
    Async {
      usersCollection.update(selector, update).map { lastError =>
        Ok
      }
    }
  }

  // link a device to a user if not done yet
  def setUserDevice(id: String) = Action(parse.json) { request =>
    val selector = Json.obj("id" -> id)
    val update = Json.obj("$addToSet" -> Json.obj("devices" -> request.body))
    Async {
      usersCollection.update(selector, update).map { lastError =>
        Ok
      }
    }
  }
}
