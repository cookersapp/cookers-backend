package models.food

import common.Utils
import models.food.dataImport.AdditifAlimentairesAdditive
import models.food.dataImport.PrixingAdditive
import play.api.libs.json._

case class AdditiveAllowed(level: Int, name: String, description: String) {
  def this(level: Int, description: String) = this(level, level match {
    case 0 => "unknown"
    case 1 => "allowed"
    case 2 => "suspicious"
    case 3 => "forbidden"
  }, description)
}
object AdditiveAllowed {
  implicit val additiveAllowedFormat = Json.format[AdditiveAllowed]
}

case class AdditiveUsage(name: String, description: String)
object AdditiveUsage {
  implicit val additiveUsageFormat = Json.format[AdditiveUsage]
}

case class AdditiveDanger(level: Int, description: String) {
  def this(level: Int) = this(level, level match {
    case 0 => "Inconnu"
    case 1 | 2 => "Sans danger"
    case 3 | 4 => "Douteux"
    case 5 | 6 => "Dangereux"
  })
}
object AdditiveDanger {
  implicit val additiveDangerFormat = Json.format[AdditiveDanger]
}

case class AdditiveRisk(danger: AdditiveDanger, category: String, description: String)
object AdditiveRisk {
  implicit val additiveRiskFormat = Json.format[AdditiveRisk]
}

case class AdditiveProduct(name: String, brand: String)
object AdditiveProduct {
  implicit val additiveProductFormat = Json.format[AdditiveProduct]
}

case class Additive(
  reference: String,
  name: String,
  humanName: Option[String],
  fullName: String,
  alias: Option[List[String]],
  authorized: Option[AdditiveAllowed],
  category: Option[String],
  usages: Option[List[AdditiveUsage]],
  origins: Option[List[String]],
  regimes: Option[Map[String, AdditiveAllowed]],
  danger: Option[AdditiveDanger],
  risks: Option[List[AdditiveRisk]],
  dailyDose: Option[String],
  description: Option[String],
  inProducts: Option[List[AdditiveProduct]]) {
  def this(reference: String) = this(reference, "", None, "", None, None, None, None, None, None, None, None, None, None, None)
}
object Additive {
  implicit val additiveFormat = Json.format[Additive]

  def mergeSources(a1: Option[AdditifAlimentairesAdditive], a2: Option[PrixingAdditive]): Option[Additive] = {
    val r1 = if (a1.isDefined) Some(from(a1.get)) else None
    val r2 = if (a2.isDefined) Some(from(a2.get)) else None
    mergeSources(List(r1, r2).flatten)
  }

  def mergeSources(list: List[Additive]): Option[Additive] = {
    if (list.isEmpty) None
    else if (list.size == 1) isValid(list(0))
    else isValid(list.tail.foldLeft(list(0)) { case (acc, elt) => merge(acc, elt) })
  }

  private def isValid(a: Additive): Option[Additive] = {
    if (!Utils.isEmpty(a.reference) && !Utils.isEmpty(a.name)) Some(a)
    else None
  }

  def from(a: PrixingAdditive): Additive = {
    val reference = a.reference
    val name = a.name
    val humanName = a.humanName
    val fullName = a.fullName
    val alias = None
    val authorized = a.authorisation.map(auth => auth match {
      case "Autorisé en france" => new AdditiveAllowed(1, "allowed", auth)
    })
    val category = a.category
    val usages = a.usage.map(u => List(new AdditiveUsage("", u)))
    val origins = a.source.map(o => List(o))
    val regimes = Some(Map(
      ("halal", new AdditiveAllowed(0, "Information non disponible")),
      ("vegetarien", new AdditiveAllowed(0, "Information non disponible")),
      ("vegetalien", new AdditiveAllowed(0, "Information non disponible")),
      ("casher", new AdditiveAllowed(0, "Information non disponible")))) // see a.regime
    val danger = a.danger.map(danger => new AdditiveDanger(danger))
    val risks = a.risks.map(r => List(new AdditiveRisk(danger.getOrElse(new AdditiveDanger(0)), "Divers", r)))
    val dailyDose = a.dailyDose
    val description = a.description
    val inProducts = None
    new Additive(reference, name, humanName, fullName, alias, authorized, category, usages, origins, regimes, danger, risks, dailyDose, description, inProducts)
  }

  def from(a: AdditifAlimentairesAdditive): Additive = {
    val reference = a.reference
    val name = a.name
    val humanName = a.humanName
    val fullName = a.fullName
    val alias = a.alias
    val authorized = a.authorized.map(auth => new AdditiveAllowed(auth.level, auth.name, auth.description))
    val category = a.category
    val usages = a.usages.map(_.map(u => new AdditiveUsage(u.name, u.description)))
    val origins = a.origins.map(_.map(o => o.name))
    val regimes = a.regimes.map(_.map { case (name, r) => (name, new AdditiveAllowed(r.allowed.level, r.allowed.name, r.allowed.description)) })
    val danger = Some(new AdditiveDanger(a.danger.level, a.danger.description))
    val risks = a.risks.map(_.map(r => new AdditiveRisk(new AdditiveDanger(r.danger.level, r.danger.description), r.category, r.description)))
    val dailyDose = None
    val description = a.description
    val inProducts = a.inProducts.map(_.map(p => new AdditiveProduct(p.name, p.brand)))
    new Additive(reference, name, humanName, fullName, alias, authorized, category, usages, origins, regimes, danger, risks, dailyDose, description, inProducts)
  }

  private def merge(a1: Additive, a2: Additive): Additive = {
    val reference = Utils.firstStr(a1.reference, a2.reference).getOrElse("")
    val name = Utils.firstStr(a1.name, a2.name).getOrElse("")
    val humanName = Utils.first(a1.humanName, a2.humanName)
    val fullName = Utils.firstStr(a1.fullName, a2.fullName).getOrElse("")
    val alias = Utils.mergeLists(a1.alias, a2.alias)
    val authorized = Utils.first(a1.authorized, a2.authorized)
    val category = Utils.first(a1.category, a2.category)
    val usages = Utils.first(a1.usages, a2.usages)
    val origins = Utils.first(a1.origins, a2.origins)
    val regimes = Utils.mergeMaps(a1.regimes, a2.regimes)
    val danger = Utils.first(a1.danger, a2.danger)
    val risks = Utils.first(a1.risks, a2.risks)
    val dailyDose = Utils.first(a1.dailyDose, a2.dailyDose)
    val description = Utils.first(a1.description, a2.description)
    val inProducts = Utils.mergeLists(a1.inProducts, a2.inProducts)
    new Additive(reference, name, humanName, fullName, alias, authorized, category, usages, origins, regimes, danger, risks, dailyDose, description, inProducts)
  }
}
