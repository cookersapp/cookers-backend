package services

import common.DateUtils
import models.UserActivity
import dao.EventsDao
import dao.UsersDao
import scala.concurrent._
import ExecutionContext.Implicits.global
import reactivemongo.api.DB
import java.util.Date
import java.util.Calendar
import play.api.Logger

object DashboardSrv {

  def main(args: Array[String]) {
    val map = Map(1413064800000L -> 29, 1413151200000L -> 15, 1413237600000L -> 6)
    println(map)
    val res = map.scanLeft(0) { case (acc, elt) => acc + elt._2 }
    println(res.tail)
  }

  def getDailyUserActivity()(implicit db: DB): Future[List[UserActivity]] = {
    // TODO : do this in mongodb...
    /*
     * http://java.dzone.com/articles/mongodb-time-series
     * http://www.mongodb.com/presentations/mongodb-time-series-data-part-2-analyzing-time-series-data-using-aggregation-framework
     * http://www.quora.com/What-is-the-best-way-to-store-time-series-data-in-MongoDB
     * http://rubayeet.wordpress.com/2013/12/29/web-analytics-using-mongodb-aggregation-framework/
     */

    val future: Future[(List[(String, Long)], List[(String, Long)])] = for {
      users <- UsersDao.getUsersCreationDate()
      events <- EventsDao.getActiveUsersByDay()
    } yield (users, events)

    future.map {
      case (users, events) => {
        val registeredUsersByDate = groupByDateAndKeepUniques(users).map { case (date, list) => (date, list.size) }
        val eventsByDate = groupByDateAndKeepUniques(events).map { case (date, list) => (date, list.size) }
        val usersEventsByDate = mergeLists(registeredUsersByDate, eventsByDate)
        val usersEventsByDateList = usersEventsByDate.toList.sortBy(e => e._1)
        val totalUsersByDate = usersEventsByDateList.scanLeft((0L, 0)) { case (acc, (date, values)) => (date, acc._2 + values._1) }.tail.toMap
        val values = mergeDoubleLists(usersEventsByDate, totalUsersByDate)

        values.map {
          case (day, (registered, actives, total)) => UserActivity(day, total, actives, registered, actives - registered, total - actives)
        }.toList.sortBy(a => a.date)
      }
    }
  }

  private def groupByDateAndKeepUniques(list: List[(String, Long)]): Map[Long, List[String]] = {
    list
      .groupBy(elt => DateUtils.timestampToStartOfDay(elt._2)) // get Map[Long, List[(String, Long)]]
      .map {
        case (date, elts) => (date, elts.map { u => u._1 }.distinct)
      }
  }
  private def mergeLists(l1: Map[Long, Int], l2: Map[Long, Int]): Map[Long, (Int, Int)] = {
    val mergedSeq = addMissingKeys(l1, l2).toSeq ++ addMissingKeys(l2, l1).toSeq
    mergedSeq.groupBy(_._1).map {
      case (date, lists) => date -> (lists(0)._2, lists(1)._2)
    }
  }
  private def mergeDoubleLists(l1: Map[Long, (Int, Int)], l2: Map[Long, Int]): Map[Long, (Int, Int, Int)] = {
    val v1 = l1.map(e => (e._1, e._2._1))
    val v2 = l1.map(e => (e._1, e._2._2))
    val v3 = l2
    val mergedSeq = addMissingKeys(v1, v3).toSeq ++ addMissingKeys(v2, v3).toSeq ++ addMissingKeys(v3, v1).toSeq
    mergedSeq.groupBy(_._1).map {
      case (date, lists) => date -> (lists(0)._2, lists(1)._2, lists(2)._2)
    }
  }
  private def addMissingKeys(dest: Map[Long, Int], src: Map[Long, Int]): Map[Long, Int] = {
    src.map { case (key, value) => (key, 0) } ++ dest
  }
}