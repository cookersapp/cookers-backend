package models

import play.api.libs.json._

case class Quantity(value: Double, unit: String, details: String)

object Quantity {
  implicit val quantityFormat = Json.format[Quantity]

  private val caseInsensitive = "(?i)"
  private val op = "[×x\\*/]"
  private val number = "[0-9,\\.]+"
  private val formula = number + " ?" + op + " ?" + number
  private val numberOrForumla = number + "|" + formula

  def create(str: String): List[Quantity] = {
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

    str.split(", ").map(q => q.trim() match {
      case specific(value, unit) => Quantity(toValue(value), unit, "")
      case dragee(value, unit) => Quantity(toValue(value), "dragee", "")
      case mg(value, unit, more) => Quantity(toValue(value), "mg", toDetails(more))
      case g(value, unit, more) => Quantity(toValue(value), "g", toDetails(more))
      case kg(value, unit, more) => Quantity(toValue(value), "kg", toDetails(more))
      case ml(value, unit, more) => Quantity(toValue(value), "ml", toDetails(more))
      case cl(value, unit, more) => Quantity(toValue(value), "cl", toDetails(more))
      case dl(value, unit, more) => Quantity(toValue(value), "dl", toDetails(more))
      case l(value, unit, more) => Quantity(toValue(value), "l", toDetails(more))
      case oz(value, unit, more) => Quantity(toValue(value), "oz", toDetails(more))
      case pz(value, unit, more) => Quantity(toValue(value), "pz", toDetails(more))
      case unit(value, unit, more) => Quantity(toValue(value), "", toDetails(more))
      case _ => null
    }).toList.filter(q => q != null)
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

  private def toDetails(str: String): String = {
    if (str != null) {
      val noBraces = "\\((.*)\\)".r
      str.trim() match {
        case noBraces(content) => content
        case res => res
      }
    } else {
      ""
    }
  }
}
