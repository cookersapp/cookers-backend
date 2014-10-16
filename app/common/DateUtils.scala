package common

import java.util.Calendar

object DateUtils {
  val weekInMillis = 1000 * 60 * 60 * 24 * 7

  def timestampToStartOfDay(timestamp: Long): Long = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    setStartOfDay(cal)
    cal.getTime().getTime()
  }

  def timestampToStartOfWeek(timestamp: Long): Long = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
    setStartOfDay(cal)
    cal.getTime().getTime()
  }

  def timestampToEndOfWeek(timestamp: Long): Long = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    cal.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
    setEndOfDay(cal)
    cal.getTime().getTime()
  }

  def weekTimestamp(week: Int): Long = {
    val cal = Calendar.getInstance();
    cal.set(Calendar.WEEK_OF_YEAR, week)
    cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
    setStartOfDay(cal)
    cal.getTime().getTime()
  }

  // zero based : 0->lundi, 1->mardi...
  def dayOfWeek(timestamp: Long): Int = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    cal.get(Calendar.DAY_OF_WEEK) - 2
  }

  private def setStartOfDay(cal: Calendar) = {
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
  }
  private def setEndOfDay(cal: Calendar) = {
    cal.set(Calendar.HOUR_OF_DAY, 23)
    cal.set(Calendar.MINUTE, 59)
    cal.set(Calendar.SECOND, 59)
    cal.set(Calendar.MILLISECOND, 999)
  }
}