package controllers

import models.User
import models.User._
import common.Validator

import play.api.mvc._
import play.api.libs.json.Json
import play.api.Logger

import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

object Users extends Controller with MongoController {
  def usersCollection: JSONCollection = db.collection[JSONCollection]("users")

  // get user with mail and create if it does not exists
  def get(email: String) = Action { request =>
    if (Validator.isEmail(email)) {
      Async {
        usersCollection.find(Json.obj("email" -> email)).one[User].map { maybeUser =>
          maybeUser.map { user =>
            Ok(Json.toJson(user))
          }.getOrElse {
            val user = new User(email)
            usersCollection.insert(user)
            Created(Json.toJson(user))
          }
        }
      }
    } else {
      BadRequest("invalid email")
    }
  }
  
  // get user with id
  
  // link a device to an email if not done yet
  def setUserDevice = Action {
    Ok
  }

  // get all users
  def getAll = Action { implicit request =>
    Async {
      val cursor = usersCollection.find(Json.obj()).sort(Json.obj("lastSeen" -> -1)).cursor[User] // get all the fields of all the users
      val futureList = cursor.toList // convert it to a list of User
      futureList.map { users => Ok(Json.toJson(users)) } // convert it to a JSON and return it
    }
  }
}