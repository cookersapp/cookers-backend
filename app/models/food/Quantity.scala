package models.food

import play.api.Logger
import play.api.libs.json._

case class Quantity(
  value: Double,
  unit: String,
  details: Option[String]) {
  def this(value: Double, unit: String) = this(value, unit, None)
}

object Quantity {
  implicit val quantityFormat = Json.format[Quantity]
  private val conversions: List[(String, String, Double)] = List(
    ("mg", "kg", 1000000),
    ("g", "kg", 1000),
    ("kg", "kg", 1),
    ("ml", "l", 1000),
    ("cl", "l", 100),
    ("dl", "l", 10),
    ("l", "l", 1))

  def convert(from: String, to: String): Double = {
    val generic = getGeneric(to)
    val ratio1 = conversions.find { case (src, dest, r) => src == from && dest == generic }.map { case (src, dest, r) => r }
    val ratio2 = conversions.find { case (src, dest, r) => src == to && dest == generic }.map { case (src, dest, r) => r }
    if (ratio1.isDefined && ratio2.isDefined) {
      ratio1.get / ratio2.get
    } else {
      Logger.warn("Can't convert <" + from + "> to <" + to + "> (generic:" + generic + ", r1:" + ratio1 + ", r2:" + ratio2 + ")")
      1
    }
  }
  def getGeneric(unit: String): String = {
    if ("mg".equals(unit) || "g".equals(unit) || "kg".equals(unit)) "kg"
    else if ("ml".equals(unit) || "cl".equals(unit) || "dl".equals(unit) || "l".equals(unit)) "l"
    else unit
  }

  private val caseInsensitive = "(?i)"
  private val op = "[×x\\*/]"
  private val number = "[0-9,\\.]+"
  private val formula = number + " ?" + op + " ?" + number
  private val numberOrForumla = number + "|" + formula

  def create(str: Option[String]): Option[List[Quantity]] = {
    val specific = (caseInsensitive + "(" + numberOrForumla + ") ?(sachet|tranche|dosette|capsule|escalope|pot|barre|pack|tube|tasse|biscuit|cup)s?").r
    val dragee = (caseInsensitive + "(" + numberOrForumla + ") ?(dragées|dragees)").r
    val mg = (caseInsensitive + "(" + numberOrForumla + ") ?(mg)( .*)?").r
    val g = (caseInsensitive + "(" + numberOrForumla + ") ?(g|gr|gr\\.|grs|g\\.|ge|grammes|gramos)( .*)?").r
    val kg = (caseInsensitive + "(" + numberOrForumla + ") ?(kg|k|Kg\\.)( .*)?").r
    val ml = (caseInsensitive + "(" + numberOrForumla + ") ?(ml|ml\\.)( .*)?").r
    val cl = (caseInsensitive + "(" + numberOrForumla + ") ?(cl)( .*)?").r
    val dl = (caseInsensitive + "(" + numberOrForumla + ") ?(dl)( .*)?").r
    val l = (caseInsensitive + "(" + numberOrForumla + ") ?(l|L|l\\.|litres?|liter|litro)( .*)?").r
    val oz = (caseInsensitive + "(" + numberOrForumla + ") ?(oz)( .*)?").r
    val pz = (caseInsensitive + "(" + numberOrForumla + ") ?(pz)( .*)?").r
    val unit = (caseInsensitive + "(" + numberOrForumla + ") ?(|pièces?|unités|piezas?|oeufs|eggs|pamplemousse|fruit|servings)( .*)?").r

    if (str.isDefined) {
      val list = str.get.split(", ").toList.map(q => q.trim() match {
        case specific(value, unit) => Some(new Quantity(toValue(value), unit.toLowerCase()))
        case dragee(value, unit) => Some(new Quantity(toValue(value), "dragee"))
        case mg(value, unit, more) => Some(new Quantity(toValue(value), "mg", toDetails(more)))
        case g(value, unit, more) => Some(new Quantity(toValue(value), "g", toDetails(more)))
        case kg(value, unit, more) => Some(new Quantity(toValue(value), "kg", toDetails(more)))
        case ml(value, unit, more) => Some(new Quantity(toValue(value), "ml", toDetails(more)))
        case cl(value, unit, more) => Some(new Quantity(toValue(value), "cl", toDetails(more)))
        case dl(value, unit, more) => Some(new Quantity(toValue(value), "dl", toDetails(more)))
        case l(value, unit, more) => Some(new Quantity(toValue(value), "l", toDetails(more)))
        case oz(value, unit, more) => Some(new Quantity(toValue(value), "oz", toDetails(more)))
        case pz(value, unit, more) => Some(new Quantity(toValue(value), "pz", toDetails(more)))
        case unit(value, unit, more) => Some(new Quantity(toValue(value), "unit", toDetails(more)))
        case _ => None
      }).filter(q => q.isDefined).map(q => q.get)
      if (list.size > 0) Some(list) else None
    } else {
      None
    }
  }

  private def toValue(str: String): Double = {
    val isKilo = ("([0-9]+)[,\\.]([0-9]{3})").r
    val isNumber = ("(" + number + ")").r
    val isFormula = ("(" + number + ")" + " ?(" + op + ") ?" + "(" + number + ")").r

    str.replace(",", ".") match {
      case isKilo(val1, val2) => val1.toDouble * 1000 + val2.toDouble
      case isNumber(value) => value.toDouble
      case isFormula(val1, op, val2) => if (op == "/") val1.toDouble / val2.toDouble else val1.toDouble * val2.toDouble
      case _ => 0
    }
  }

  private def toDetails(str: String): Option[String] = {
    if (str != null) {
      val noBraces = "\\((.*)\\)".r
      str.trim() match {
        case noBraces(content) => Some(content)
        case res => Some(res)
      }
    } else {
      None
    }
  }
}
