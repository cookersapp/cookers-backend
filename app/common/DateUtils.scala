package common

import java.util.Calendar

object DateUtils {
  def timestampToStartOfDay(timestamp: Long): Long = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    cal.getTime().getTime()
  }

  def timestampToEndOfWeek(timestamp: Long): Long = {
    val cal = Calendar.getInstance();
    cal.setTimeInMillis(timestamp)
    cal.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
    cal.set(Calendar.HOUR_OF_DAY, 23)
    cal.set(Calendar.MINUTE, 59)
    cal.set(Calendar.SECOND, 59)
    cal.set(Calendar.MILLISECOND, 999)
    cal.getTime().getTime()
  }

  def weekTimestamp(week: Int): Long = {
    val cal = Calendar.getInstance();
    cal.set(Calendar.WEEK_OF_YEAR, week)
    cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    cal.getTime().getTime()
  }
}