package common

import java.text.SimpleDateFormat
import java.util.Date
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.Play
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

object Utils {
  // possible values for env : 'local', 'dev', 'prod', 'undefined'
  def getEnv(): String = Play.current.configuration.getString("application.env").getOrElse("undefined")
  def isProd(): Boolean = "prod".equals(getEnv())

  def isEmpty(str: String): Boolean = str == null || str.trim().isEmpty()
  def trim(str: String): String = if (str != null) str.trim() else null
  def toDate(date: String, format: String): Date = new SimpleDateFormat(format).parse(trim(date))
  def toOpt(str: String): Option[String] = if (isEmpty(str)) None else Some(trim(str))
  def isEmpty(json: JsValue): Boolean = "null".equals(Json.stringify(json)) || "{}".equals(Json.stringify(json)) || "[]".equals(Json.stringify(json))
  def toOpt(json: JsValue): Option[JsValue] = if (isEmpty(json)) None else Some(json)

  def head[T](list: List[T]): Option[T] = if (list.isEmpty) None else Some(list.head)
  def tail[T](list: List[T]): Option[List[T]] = if (list.isEmpty) None else Some(list.tail)
  def head[T](list: Option[List[T]]): Option[T] = if (list.isEmpty || list.get.isEmpty) None else Some(list.get.head)
  def tail[T](list: Option[List[T]]): Option[List[T]] = if (list.isEmpty || list.get.isEmpty) None else Some(list.get.tail)

  def first[T](values: Option[T]*): Option[T] = values.find(d => d.isDefined).getOrElse(None)
  def firstStr(values: String*): Option[String] = values.find(str => !isEmpty(str))
  def firstStr(values: List[String]): Option[String] = values.find(str => !isEmpty(str))
  def notEmpty[T](list: List[T]): Option[List[T]] = if (list.size > 0) Some(list) else None
  def notEmpty[T, U](map: Map[T, U]): Option[Map[T, U]] = if (map.size > 0) Some(map) else None
  def notEmpty[T](listOpt: Option[List[T]]): Option[List[T]] = if (listOpt.isDefined && listOpt.get.size > 0) listOpt else None
  def asList[T](values: Option[T]*): List[T] = values.filter(str => str.isDefined).map(str => str.get).toList
  def mergeLists[T](l1: Option[List[T]], l2: Option[List[T]]): Option[List[T]] = notEmpty((l1.getOrElse(List()) ++ l2.getOrElse(List())).distinct)
  def mergeMaps[T, U](m1: Option[Map[T, U]], m2: Option[Map[T, U]]): Option[Map[T, U]] =
    notEmpty((m1.getOrElse(Map()).toSeq ++ m2.getOrElse(Map()).toSeq)
      .groupBy(_._1)
      .map { case (key, values) => if (values.size > 0) Some(key, values.head._2) else None }
      .flatten.toMap)

  def transform[T, U](pair: (Option[T], Option[U])): Option[(T, U)] = for (a <- pair._1; b <- pair._2) yield (a, b)
  def transform[A](o: Option[Future[A]]): Future[Option[A]] = o.map(f => f.map(Option(_))).getOrElse(Future.successful(None))

  def toSlug(input: String): String = {
    import java.text.Normalizer
    Normalizer.normalize(input, Normalizer.Form.NFD)
      .replaceAll("[^\\w\\s-]", "") // Remove all non-word, non-space or non-dash characters
      .replace('-', ' ') // Replace dashes with spaces
      .trim // Trim leading/trailing whitespace (including what used to be leading/trailing dashes)
      .replaceAll("\\s+", "-") // Replace whitespace (including newlines and repetitions) with single dashes
      .toLowerCase // Lowercase the final results
  }

  def addId(json: JsValue): JsValue = {
    val addIdTransformer = (__).json.update(__.read[JsObject].map { originalData => originalData ++ Json.obj("id" -> BSONObjectID.generate.stringify) })
    json.transform(addIdTransformer).get
  }

  def simpleMatch(content: String, regex: String): Option[String] = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(value) => Utils.toOpt(value)
      case _ => None
    }
  }
  def doubleMatch(content: String, regex: String): (Option[String], Option[String]) = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(val1, val2) => (Utils.toOpt(val1), Utils.toOpt(val2))
      case _ => (None, None)
    }
  }
  def tripleMatch(content: String, regex: String): (Option[String], Option[String], Option[String]) = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(val1, val2, val3) => (Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3))
      case _ => (None, None, None)
    }
  }
  def simpleMatchMulti(content: String, regex: String): Option[List[String]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(value) => Utils.toOpt(value)
      case _ => None
    }.toList.flatten
    Utils.notEmpty(res)
  }
  def doubleMatchMulti(content: String, regex: String): Option[List[(Option[String], Option[String])]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(val1, val2) => Some(Utils.toOpt(val1), Utils.toOpt(val2))
      case _ => None
    }.toList.flatten
    Utils.notEmpty(res)
  }
  def tripleMatchMulti(content: String, regex: String): Option[List[(Option[String], Option[String], Option[String])]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(val1, val2, val3) => Some(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3))
      case _ => None
    }.toList.flatten
    Utils.notEmpty(res)
  }
  def quadrupleMatchMulti(content: String, regex: String): Option[List[(Option[String], Option[String], Option[String], Option[String])]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(val1, val2, val3, val4) => Some(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3), Utils.toOpt(val4))
      case _ => None
    }.toList.flatten
    Utils.notEmpty(res)
  }
}