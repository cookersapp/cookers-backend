package models.food.dataImport

import common.Utils
import play.api.libs.json._

/*
 * Data from http://www.prixing.fr/
 */

case class PrixingAdditive(
  version: Int,
  id: String,
  reference: String,
  name: String,
  humanName: Option[String],
  fullName: String,
  danger: Option[Int],
  dangerName: Option[String],
  source: Option[String],
  origin: Option[String],
  category: Option[String],
  authorisation: Option[String],
  dailyDose: Option[String],
  risks: Option[String],
  toxicity: Option[String],
  regime: Option[String],
  usage: Option[String],
  description: Option[String],
  url: String) {

  def this(id: String, fullName: String) = this(
    PrixingAdditive.VERSION,
    id,
    PrixingAdditive.reference(fullName),
    PrixingAdditive.name(fullName),
    Some(PrixingAdditive.humanName(fullName)),
    fullName,
    None, None, None, None, None, None, None, None, None, None, None, None, PrixingAdditive.getUrl(id))

  def isValid: Boolean = {
    this.version == PrixingAdditive.VERSION
  }
}

object PrixingAdditive {
  val VERSION = 1
  implicit val prixingAdditiveFormat = Json.format[PrixingAdditive]

  def getUrl(prixingId: String): String = "http://www.prixing.fr/additives/" + prixingId + "/show"

  def create(prixingId: String, content: String): Option[PrixingAdditive] = {
    val name = getName(content).getOrElse("")
    val reference = name.toLowerCase()
    val humanName = getHumanName(content)
    val fullName = humanName.map(str => name + " - " + str).getOrElse(name)
    val danger = getDanger(content)
    val dangerName = getDangerName(content)
    val source = getSource(content)
    val origin = getOrigin(content)
    val category = getCategory(content)
    val authorisation = getAuthorisation(content)
    val dailyDose = getDailyDose(content)
    val risks = getRisks(content)
    val toxicity = getToxicity(content)
    val regime = getRegime(content)
    val usage = getUsage(content)
    val description = getDescription(content)
    val url = getUrl(prixingId)
    isValid(new PrixingAdditive(VERSION, prixingId, reference, name, humanName, fullName, danger, dangerName, source, origin, category, authorisation, dailyDose, risks, toxicity, regime, usage, description, url))
  }

  def reference(fullName: String): String = fullName.split(" ")(0).toLowerCase()
  def name(fullName: String): String = fullName.split(" - ")(0)
  def humanName(fullName: String): String = fullName.split(" - ")(1)

  private def isValid(p: PrixingAdditive): Option[PrixingAdditive] = {
    if (!Utils.isEmpty(p.id) && !Utils.isEmpty(p.reference) && !Utils.isEmpty(p.name)) Some(p)
    else None
  }

  private def getName(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h2>([^ ]*) - .*</h2>")
  private def getDanger(content: String): Option[Int] = Utils.simpleMatch(content, "(?i)<img alt=\"Additive_dangerousness_([0-9]*)\"").map(s => s.toInt)
  private def getDangerName(content: String): Option[String] = Utils.simpleMatch(content, "(?i).png\" /><br/>(.*)</span></td>")
  private def getHumanName(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h2>[^ ]* - (.*)</h2>")
  private def getSource(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h5>(.*)</h5>")
  private def getCategory(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Type</h4>\n(.*)</br>")
  private def getAuthorisation(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Autorisation</h4>\n(.*)</br>")
  private def getDailyDose(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Dose journalière admissible</h4>\n(.*)</br>")
  private def getOrigin(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Origine</h4>\n(.*)</br>")
  private def getRisks(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Risques et effets secondaires</h4>\n(.*)</br>")
  private def getToxicity(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Toxicité</h4>\n(.*)</br>")
  private def getRegime(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Restrictions alimentaires</h4>\n(.*)</br>")
  private def getUsage(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Fonction</h4>\n(.*)</br>")
  private def getDescription(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h4>Description</h4>\n(.*)</br>")
}
