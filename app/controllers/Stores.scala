package controllers

import models.Store
import dao.StoresDao
import scala.concurrent.Future
import play.api.mvc._
import play.api.libs.json._
import play.modules.reactivemongo.MongoController

object Stores extends Controller with MongoController {
  implicit val DB = db

  def getAll = Action {
    Async {
      StoresDao.all().map { stores => Ok(Json.obj("status" -> 200, "data" -> stores)) }
    }
  }

  def get(id: String) = Action {
    Async {
      StoresDao.findById(id).map {
        case Some(store) => Ok(Json.obj("status" -> 200, "data" -> store))
        case None => NotFound(Json.obj("status" -> 404, "message" -> "Store not found !"))
      }
    }
  }

  def create = Action(parse.json) { request =>
    Async {
      val name = (request.body \ "name").asOpt[String]
      if (name.isDefined) {
        val store = new Store(name.get)
        StoresDao.insert(store).map { lastError =>
          lastError.inError match {
            case false => Ok(Json.obj("status" -> 200, "data" -> store))
            case true => InternalServerError(Json.obj("message" -> lastError.errMsg.getOrElse("").toString()))
          }
        }
      } else {
        Future.successful(BadRequest("Can't find property 'name' of Store !"))
      }
    }
  }
}