package models.food.dataImport

import common.Utils
import services.FoodSrv
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._

case class AdditifAlimentairesAdditiveDanger(level: Int, description: String) {
  def this(level: Int) = this(level, level match {
    case 0 => "Inconnu"
    case 1 | 2 => "Sans danger"
    case 3 | 4 => "Douteux"
    case 5 | 6 => "Dangereux"
  })
}
object AdditifAlimentairesAdditiveDanger {
  implicit val additifAlimentairesAdditiveDangerFormat = Json.format[AdditifAlimentairesAdditiveDanger]
}

case class AdditifAlimentairesAdditiveAllowed(level: Int, name: String, description: String) {
  def this(level: Int, description: String) = this(level, level match {
    case 0 => "unknown"
    case 1 => "allowed"
    case 2 => "suspicious"
    case 3 => "forbidden"
  }, description)
}
object AdditifAlimentairesAdditiveAllowed {
  implicit val additifAlimentairesAdditiveAllowedFormat = Json.format[AdditifAlimentairesAdditiveAllowed]
}

case class AdditifAlimentairesAdditiveUsage(name: String, description: String, link: String)
object AdditifAlimentairesAdditiveUsage {
  implicit val additifAlimentairesAdditiveUsageFormat = Json.format[AdditifAlimentairesAdditiveUsage]
}

case class AdditifAlimentairesProduct(name: String, brand: String, details: Option[String])
object AdditifAlimentairesProduct {
  implicit val additifAlimentairesProductFormat = Json.format[AdditifAlimentairesProduct]
}

case class AdditifAlimentairesAdditiveOrigin(name: String, image: Option[String])
object AdditifAlimentairesAdditiveOrigin {
  implicit val additifAlimentairesAdditiveOriginFormat = Json.format[AdditifAlimentairesAdditiveOrigin]
}

case class AdditifAlimentairesAdditiveDiet(name: String, image: String, link: String, allowed: AdditifAlimentairesAdditiveAllowed)
object AdditifAlimentairesAdditiveDiet {
  implicit val additifAlimentairesAdditiveDietFormat = Json.format[AdditifAlimentairesAdditiveDiet]
}

case class AdditifAlimentairesAdditiveRisk(danger: AdditifAlimentairesAdditiveDanger, category: String, description: String)
object AdditifAlimentairesAdditiveRisk {
  implicit val additifAlimentairesAdditiveRiskFormat = Json.format[AdditifAlimentairesAdditiveRisk]
}

case class AdditifAlimentairesAdditiveMolecule(formula: String, image: Option[String], source: Option[String])
object AdditifAlimentairesAdditiveMolecule {
  implicit val additifAlimentairesAdditiveMoleculeFormat = Json.format[AdditifAlimentairesAdditiveMolecule]
}

case class AdditifAlimentairesAdditiveSimilar(id: String, category: String, reference: String, name: String, humanName: String)
object AdditifAlimentairesAdditiveSimilar {
  implicit val additifAlimentairesAdditiveSimilarFormat = Json.format[AdditifAlimentairesAdditiveSimilar]
}

case class AdditifAlimentairesAdditiveArticle(category: String, name: String, link: String)
object AdditifAlimentairesAdditiveArticle {
  implicit val additifAlimentairesAdditiveArticleFormat = Json.format[AdditifAlimentairesAdditiveArticle]
}

case class AdditifAlimentairesAdditive(
  version: Int,
  id: String,
  reference: String,
  name: String,
  humanName: Option[String],
  fullName: String,
  alias: Option[List[String]], // see e101
  authorized: Option[AdditifAlimentairesAdditiveAllowed],
  category: Option[String],
  usages: Option[List[AdditifAlimentairesAdditiveUsage]],
  inProducts: Option[List[AdditifAlimentairesProduct]], // see e407
  origins: Option[List[AdditifAlimentairesAdditiveOrigin]], // see e101
  regimes: Option[Map[String, AdditifAlimentairesAdditiveDiet]],
  risks: Option[List[AdditifAlimentairesAdditiveRisk]],
  danger: AdditifAlimentairesAdditiveDanger,
  description: Option[String],
  molecule: Option[AdditifAlimentairesAdditiveMolecule], // see e101
  similars: Option[List[AdditifAlimentairesAdditiveSimilar]],
  sameCategory: Option[List[AdditifAlimentairesAdditiveSimilar]],
  articles: Option[List[AdditifAlimentairesAdditiveArticle]],
  url: String) {

  def isValid: Boolean = {
    this.version == AdditifAlimentairesAdditive.VERSION
  }

  override def toString(): String = {
    val tab = "  "
    var ret = ""
    ret += ("AdditifAlimentairesAdditive(\n")
    ret += (tab + "id: " + id + "\n")
    ret += (tab + "reference: " + reference + "\n")
    ret += (tab + "name: " + name + "\n")
    ret += (tab + "humanName: " + humanName + "\n")
    ret += (tab + "fullName: " + fullName + "\n")
    ret += (tab + "alias: " + alias + "\n")
    ret += (tab + "authorized: " + authorized + "\n")
    ret += (tab + "category: " + category + "\n")
    ret += (tab + "usages:\n"); usages.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "inProducts:\n"); inProducts.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "origin:\n"); origins.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "regimes:\n"); regimes.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "risks:\n"); risks.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "danger: " + danger + "\n")
    ret += (tab + "description: " + description + "\n")
    ret += (tab + "molecule: " + molecule + "\n")
    ret += (tab + "similars:\n"); similars.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "sameCategory:\n"); sameCategory.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "articles:\n"); articles.map(l => l.map(u => ret += (tab + tab + u + "\n")))
    ret += (tab + "url: " + url + "\n")
    ret += (")")
    ret
  }
}

object AdditifAlimentairesAdditive {
  implicit val additifAlimentairesAdditiveFormat = Json.format[AdditifAlimentairesAdditive]

  val VERSION = 1
  val URL = "http://les-additifs-alimentaires.com"
  def getSearchUrl(reference: String): String = URL + "/recherche.php?rech=" + reference
  def getUrl(id: String): String = URL + "/" + id + ".php"

  def getIdFromSearch(reference: String, content: String): Option[String] = Utils.simpleMatch(content, "(?i)href='/(.*).php' > <b>" + reference + "</b> - ")

  def create(id: String, content: String): Option[AdditifAlimentairesAdditive] = {
    val name = getName(content).getOrElse("")
    val reference = name.toLowerCase()
    val humanName = getHumanName(content)
    val fullName = humanName.map(h => name + " - " + h).getOrElse(name)
    val alias = getAlias(content).flatMap(list => Utils.notEmpty(list.filter(n => humanName.isEmpty || !humanName.get.equals(n))))
    val authorized = getAuthorized(content)
    val category = getCategory(content)
    val usages = getUsages(content)
    val inProducts = getInProducts(content)
    val origins = getOrigins(content)
    val regimes = getRegimes(content)
    val risks = getRisks(content)
    val danger = risks.flatMap { list =>
      val dangers = list.map(r => r.danger)
      dangers.foldLeft(Utils.head(dangers)) {
        case (acc, elt) => if (acc.isEmpty || acc.get.level < elt.level) Some(elt) else acc
      }
    }.getOrElse(new AdditifAlimentairesAdditiveDanger(1, "Sans danger"))
    val description = getDescription(content)
    val molecule = getMolecule(content)
    val similars = getSimilars(content)
    val sameCategory = getSameCategory(content)
    val articles = getArticles(content)
    val url = getUrl(id)
    isValid(new AdditifAlimentairesAdditive(VERSION, id, reference, name, humanName, fullName, alias, authorized, category, usages, inProducts, origins, regimes, risks, danger, description, molecule, similars, sameCategory, articles, url))
  }

  private def isValid(a: AdditifAlimentairesAdditive): Option[AdditifAlimentairesAdditive] = {
    if (!Utils.isEmpty(a.id) && !Utils.isEmpty(a.reference) && !Utils.isEmpty(a.name)) Some(a)
    else None
  }

  def getName(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h1>Additif (.*) - .*</h1>")

  def getHumanName(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<h1>Additif .* - (.*)</h1>")

  def getAlias(content: String): Option[List[String]] = Utils.simpleMatch(content, "(?i)<li  class='noms' ><div><span>(.*)</span></div></li>").map(s => s.split("</span> <span>").toList)

  def getAuthorized(content: String): Option[AdditifAlimentairesAdditiveAllowed] =
    Utils.transform(Utils.doubleMatch(content, "(?i)<li><div class='legende'>Loi</div><div style=\"color:(#[0-9a-zA-Z]*)\"><b>([\\w\\W]*)</b></div></li>")).map {
      case (color, info) => allowed(color, info)
    }

  def getCategory(content: String): Option[String] = Utils.simpleMatch(content, "(?i)<li class='famille'><div class='legende'>Famille</div><div>(.*)</div></li>")

  def getUsages(content: String): Option[List[AdditifAlimentairesAdditiveUsage]] =
    Utils.quadrupleMatchMulti(content,
      "(?i)<a href='([^']*)'>(.*)</a> " +
        "<span style='color:#2D81FF;text-decoration:underline;cursor:pointer;' onclick='toogle[0-9]*\\(\\);' >\\?</span>" +
        "<span id='def([0-9]*)' >\\(([^)]*)\\)</span><script>")
      .map { opt =>
        opt.map {
          case (ref, name, defId, defName) => name.map(n => new AdditifAlimentairesAdditiveUsage(n, defName.getOrElse("").replace("\r\n", " ").trim(), ref.map(s => URL + s).getOrElse("")))
        }
      }.flatMap(list => Utils.notEmpty(list.flatten))

  def getInProducts(content: String): Option[List[AdditifAlimentairesProduct]] =
    Utils.simpleMatch(content, "(?i)<li><div class='legende'>Utilisé dans</div><div>(.*)\\.<br>" +
      "<small style='color:grey;' >Liste non exaustive d'exemple d'utilisations. Les marques citées appartiennent à leurs propriétaires respectifs.</small></div></li>").map { products =>
      products.split(", ").toList.map { product =>
        val (nameOpt, brandOpt, detailsOpt) = Utils.tripleMatch(product, "(?i)(.*) <span style='font-style: italic;'>(.*)</span>(.*)")
        nameOpt.map(name => new AdditifAlimentairesProduct(name, brandOpt.getOrElse(""), detailsOpt))
      }
    }.flatMap(list => Utils.notEmpty(list.flatten))

  def getOrigins(content: String): Option[List[AdditifAlimentairesAdditiveOrigin]] =
    Utils.doubleMatchMulti(content, "(?i)<div class=\"Origine\" >(?:<img  ?src=\"([^>]*)\"> )?([^/]*)</div>").map { list =>
      list.map { case (imgOpt, nameOpt) => nameOpt.map(name => new AdditifAlimentairesAdditiveOrigin(name, imgOpt.map(img => URL + img))) }
    }.flatMap(list => Utils.notEmpty(list.flatten))

  def getRegimes(content: String): Option[Map[String, AdditifAlimentairesAdditiveDiet]] =
    Utils.tripleMatchMulti(content, "(?i)<li style='overflow:auto;'>" +
      "<a style='float:left;margin-right:5px;' href='([^']*)'><img style='height:20px;' src='([^']*)'></a>([^/]*)(?:</span>)?</li>").map(opt => opt.map {
      case (linkOpt, imgOpt, regimeContent) => {
        val (colorOpt, textOpt) = regimeContent.map { text =>
          val res = Utils.doubleMatch(text, "(?i)<span style='color:(#[0-9a-zA-Z]*);' >([^<]*)<br>")
          if (res._1.isDefined) res else (None, regimeContent)
        }.getOrElse((None, regimeContent))
        val nameOpt = imgOpt.flatMap(img => Utils.simpleMatch(img, "/ressources-242/images/regimes/(.*).svg"))

        nameOpt.map(name => (name, new AdditifAlimentairesAdditiveDiet(
          name,
          imgOpt.map(img => URL + img).getOrElse(""),
          linkOpt.map(link => URL + link).getOrElse(""),
          allowed(colorOpt.getOrElse(""), textOpt.getOrElse("").replace("<br>", " ").trim()))))
      }
    }).flatMap(list => Utils.notEmpty(list.flatten.toMap))

  def getRisks(content: String): Option[List[AdditifAlimentairesAdditiveRisk]] =
    Utils.simpleMatch(content, "(?i)<li class='risques'><div class='legende'>Risques</div><div>(.*)</div></li>").flatMap { risks =>
      Utils.tripleMatchMulti(risks, "<span style='background-color:(#[A-Za-z-0-9]*);'>&nbsp;([^&]*)&nbsp;</span> , ([^<]*)<br>").map { results =>
        results.map {
          case (colorOpt, categoryOpt, descriptionOpt) => colorOpt.map(color => new AdditifAlimentairesAdditiveRisk(danger(color), categoryOpt.getOrElse(""), descriptionOpt.getOrElse("")))
        }
      }
    }.flatMap(list => Utils.notEmpty(list.flatten))

  def getDescription(content: String): Option[String] =
    Utils.simpleMatch(content, "(?i)<li class='description'><div class='legende'>Description</div><div><b>[^<]*</b><br>([^/]*)</div></li>")

  def getMolecule(content: String): Option[AdditifAlimentairesAdditiveMolecule] =
    Utils.simpleMatch(content, "(?i)<li><div class='legende'>Molécule</div><div>([\\w\\W]*)</div></li>").flatMap { molecule =>
      val formulaOpt = Utils.simpleMatch(molecule, "(?i)(.*)")
      val imageOpt = Utils.simpleMatch(molecule, "(?i).*<img style='display:block;margin:auto;max-width:100%;width:300px;' src='([^']*)'>.*")
      val sourceOpt = Utils.simpleMatch(molecule, "(?i).*<div style='text-align:center;font-size:10px;color:#a0a0a0;'>(.*)</div>")
      formulaOpt.map(formula => AdditifAlimentairesAdditiveMolecule(formula, imageOpt.map(img => URL + "/" + img), sourceOpt))
    }

  def getSimilars(content: String): Option[List[AdditifAlimentairesAdditiveSimilar]] =
    Utils.quadrupleMatchMulti(content, "(?i)<li class='addlien'><a href='/([^']*)\\.php'><span>Additifs similaires</span>([^<]*)<br>([^<]*)<br>([^<]*)</a></li>").map(opt => opt.map {
      case (idOpt, categoryOpt, nameOpt, humanNameOpt) =>
        idOpt.map(id => new AdditifAlimentairesAdditiveSimilar(id, categoryOpt.getOrElse(""), nameOpt.getOrElse("").toLowerCase(), nameOpt.getOrElse(""), humanNameOpt.getOrElse("")))
    }).flatMap(list => Utils.notEmpty(list.flatten))

  def getSameCategory(content: String): Option[List[AdditifAlimentairesAdditiveSimilar]] =
    Utils.quadrupleMatchMulti(content, "(?i)<li class='addlien'><a href='/([^']*)\\.php'><span>Additifs de même famille</span>([^<]*)<br>([^<]*)<br>([^<]*)</a></li>").map(opt => opt.map {
      case (idOpt, categoryOpt, nameOpt, humanNameOpt) =>
        idOpt.map(id => new AdditifAlimentairesAdditiveSimilar(id, categoryOpt.getOrElse(""), nameOpt.getOrElse("").toLowerCase(), nameOpt.getOrElse(""), humanNameOpt.getOrElse("")))
    }).flatMap(list => Utils.notEmpty(list.flatten))

  def getArticles(content: String): Option[List[AdditifAlimentairesAdditiveArticle]] =
    Utils.tripleMatchMulti(content, "(?i)<li class='infoslien'><a href='([^']*)'><span>.* dans</span>(.*) - ([^<]*)</a></li>").map(opt => opt.map {
      case (linkOpt, categoryOpt, nameOpt) =>
        linkOpt.map(link => AdditifAlimentairesAdditiveArticle(categoryOpt.getOrElse(""), nameOpt.getOrElse(""), URL + link))
    }).flatMap(list => Utils.notEmpty(list.flatten))

  private def danger(color: String): AdditifAlimentairesAdditiveDanger = color match {
    case "#427d06" => new AdditifAlimentairesAdditiveDanger(1)
    case "#67b800" => new AdditifAlimentairesAdditiveDanger(2)
    case "#b0cc00" => new AdditifAlimentairesAdditiveDanger(3)
    case "#cc9800" => new AdditifAlimentairesAdditiveDanger(4)
    case "#cc5800" => new AdditifAlimentairesAdditiveDanger(5)
    case "#cc0000" => new AdditifAlimentairesAdditiveDanger(6)
    case c => new AdditifAlimentairesAdditiveDanger(0)
  }
  private def allowed(color: String, description: String): AdditifAlimentairesAdditiveAllowed = color match {
    case "#209920" | "#00b000" => new AdditifAlimentairesAdditiveAllowed(1, description)
    case "#b0b000" => new AdditifAlimentairesAdditiveAllowed(2, description)
    case "#ff2020" | "#b00000" => new AdditifAlimentairesAdditiveAllowed(3, description)
    case "#b0b0b0" | _ => new AdditifAlimentairesAdditiveAllowed(0, description)
  }
}
