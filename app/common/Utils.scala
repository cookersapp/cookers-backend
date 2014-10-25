package common

import java.text.SimpleDateFormat
import java.util.Date
import play.api.Play
import play.api.libs.json._

object Utils {
  // possible values for env : 'local', 'dev', 'prod', 'undefined'
  def getEnv(): String = Play.current.configuration.getString("application.env").getOrElse("undefined")
  def isProd(): Boolean = "prod".equals(getEnv())

  def isEmpty(json: JsValue): Boolean = "null".equals(Json.stringify(json)) || "{}".equals(Json.stringify(json)) || "[]".equals(Json.stringify(json))
  def isEmpty(str: String): Boolean = str == null || str.trim().isEmpty()
  def trim(str: String): String = if (str != null) str.trim() else null
  def toDate(date: String, format: String): Date = new SimpleDateFormat(format).parse(trim(date))
  def toOpt(str: String): Option[String] = if (isEmpty(str)) None else Some(trim(str))

  def head[T](list: List[T]): Option[T] = if (list.isEmpty) None else Some(list.head)
  def tail[T](list: List[T]): Option[List[T]] = if (list.isEmpty) None else Some(list.tail)

  def sequence[T, U](pair: (Option[T], Option[U])): Option[(T, U)] = for (a <- pair._1; b <- pair._2) yield (a, b)
  def first[T](values: Option[T]*): Option[T] = values.find(d => d.isDefined).getOrElse(None)
  def notEmpty[T](list: List[T]): Option[List[T]] = if (list.size > 0) Some(list) else None
  def asList[T](values: Option[T]*): List[T] = values.filter(str => str.isDefined).map(str => str.get).toList
  def mergeLists[T](l1: Option[List[T]], l2: Option[List[T]]): Option[List[T]] = Utils.notEmpty((l1.getOrElse(List()) ++ l2.getOrElse(List())).distinct)
}