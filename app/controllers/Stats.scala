package controllers

import common.DateUtils
import dao.EventsDao
import dao.MalformedEventsDao
import dao.UsersDao
import models.Event
import models.Event.eventFormat
import models.UserActivity
import services.DashboardSrv
import scala.Array.canBuildFrom
import scala.concurrent._
import play.api.libs.json.Json
import play.api.mvc.Action
import play.api.mvc.Controller
import play.api.Logger
import play.modules.reactivemongo.MongoController

object Stats extends Controller with MongoController {
  implicit val DB = db
  val weekInMillis = 1000 * 60 * 60 * 24 * 7

  def weekData(week: Option[Int]) = Action {
    Async {
      val to: Long = if (week.isEmpty) System.currentTimeMillis else DateUtils.timestampToEndOfWeek(DateUtils.weekTimestamp(week.get))
      val from: Long = to - weekInMillis

      val future: Future[(Int, Int, Int, Int, Int, Int, Int, Int, Int, Int)] = for {
        totalUsers <- UsersDao.createdBefore(to)
        beforeUsers <- UsersDao.createdBefore(from)
        activeUsers <- EventsDao.getActiveUsers(from, to).map { users => users.size }
        ingredients <- EventsDao.fired("recipe-ingredients-showed", from, to)
        details <- EventsDao.fired("recipe-details-showed", from, to)
        cart <- EventsDao.fired("recipe-added-to-cart", from, to)
        cooking <- EventsDao.fired("recipe-cook-showed", from, to)
        cooked <- EventsDao.fired("recipe-cooked", from, to)
        bought <- EventsDao.fired("item-bought", from, to)
        all <- EventsDao.fired(from, to)
      } yield (totalUsers, beforeUsers, activeUsers, ingredients, details, cart, cooking, cooked, bought, all)

      future.map {
        case (totalUsers, beforeUsers, activeUsers, ingredients, details, cart, cooking, cooked, bought, all) =>
          val newUsers = totalUsers - beforeUsers
          val recurringUsers = activeUsers - newUsers
          val inactiveUsers = beforeUsers - recurringUsers
          Ok(Json.obj(
            "period" -> Json.obj(
              "from" -> from,
              "to" -> to),
            "users" -> Json.obj(
              "total" -> totalUsers,
              "new" -> newUsers,
              "active" -> recurringUsers,
              "inactive" -> inactiveUsers),
            "recipes" -> Json.obj(
              "ingredients" -> ingredients,
              "details" -> details,
              "cart" -> cart,
              "cooking" -> cooking,
              "cooked" -> cooked),
            "items" -> Json.obj(
              "bought" -> bought),
            "events" -> Json.obj(
              "sent" -> all)))
      }
    }
  }

  // interval could be 'day' or 'week'
  def userActivity(interval: Option[String]) = Action {
    Async {
      val result: Future[List[UserActivity]] = DashboardSrv.getUserActivity(interval.getOrElse("week"))
      result.map { activity =>
        Ok(Json.obj("activity" -> activity))
      }
    }
  }
}