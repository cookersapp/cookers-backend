package models.food.dataImport

import common.Utils
import models.food.Rating
import models.food.Price
import java.util.Date
import play.api.libs.json._

case class PrixingProductInfo(
  allergenes: Option[String],
  composition: Option[String],
  description: Option[String],
  energy: Option[String],
  extra: Option[String],
  help: Option[String],
  informations: Option[String],
  informationsGlobal: Option[String],
  ingredients: Option[String],
  nutrition: Option[String],
  nutrition100: Option[String],
  nutritionnel: Option[String],
  nutritionnel2: Option[String],
  origine: Option[String],
  presentation: Option[String],
  quantity: Option[String],
  tips: Option[String])
object PrixingProductInfo {
  implicit val prixingProductInfoFormat = Json.format[PrixingProductInfo]
}

case class PrixingOpinion(
  name: String,
  date: String,
  timestamp: Date,
  rating: Int,
  comment: String)
object PrixingOpinion {
  implicit val prixingOpinionFormat = Json.format[PrixingOpinion]
}

case class PrixingAdditive(
  id: Option[String],
  name: String,
  fullName: String,
  url: Option[String])
object PrixingAdditive {
  implicit val prixingAdditiveFormat = Json.format[PrixingAdditive]
}

case class PrixingProduct(
  barcode: String,
  name: Option[String],
  images: Option[List[String]],
  category: Option[String],
  categoryUrl: Option[String],
  shortDescription: Option[String],
  rating: Option[Rating],
  price: Option[Price],
  additives: Option[List[PrixingAdditive]],
  infos: PrixingProductInfo,
  opinionRating: Option[Rating],
  opinions: Option[List[PrixingOpinion]])

object PrixingProduct {
  implicit val prixingProductFormat = Json.format[PrixingProduct]

  def create(barcode: String, content: String): Option[PrixingProduct] = {
    val allergenes = getAllergenes(content)
    val composition = getComposition(content)
    val description = getDescription(content)
    val energy = getEnergy(content)
    val extra = getExtra(content)
    val help = getHelp(content)
    val informations = getInformations(content)
    val informationsGlobal = getInformationsGlobal(content)
    val ingredients = getIngredients(content)
    val nutrition = getNutrition(content)
    val nutrition100 = getNutrition100(content)
    val nutritionnel = getNutritionnel(content)
    val nutritionnel2 = getNutritionnel2(content)
    val origine = getOrigine(content)
    val presentation = getPresentation(content)
    val quantity = getQuantity(content)
    val tips = getTips(content)
    val infos = new PrixingProductInfo(allergenes, composition, description, energy, extra, help, informations, informationsGlobal, ingredients, nutrition, nutrition100, nutritionnel, nutritionnel2, origine, presentation, quantity, tips)

    val name = getName(content)
    val images = getImages(content)
    val (category, categoryUrl) = getCategory(content)
    val shortDescription = getShortDesc(content)
    val rating = getRating(content)
    val price = getprice(content)
    val additives = getAdditives(content)
    val opinionRating = getOpinionRating(content)
    val opinions = getOpinions(content)
    val product = new PrixingProduct(barcode, name, images, category, categoryUrl, shortDescription, rating, price, additives, infos, opinionRating, opinions)

    isValid(product)
  }

  private def isValid(p: PrixingProduct): Option[PrixingProduct] = {
    if (!Utils.isEmpty(p.barcode) && p.name.isDefined && p.images.isDefined) Some(p)
    else None
  }

  private def getName(content: String): Option[String] = simpleMatch(content, "<h1>(.*)</h1>")
  private def getImages(content: String): Option[List[String]] = simpleMatchMulti(content, "<img alt=\"\" class=\"img-produit\" src=\"([^\"]*)\" />").map(elt => elt.map(rel => "http://www.prixing.fr" + rel))
  private def getCategory(content: String): (Option[String], Option[String]) = {
    val ret = doubleMatch(content, "<a href=\"/products/categories/([^\"]*)\">([^<]*)</a>")
    (ret._2, ret._1.map(url => "http://www.prixing.fr/products/categories/" + url))
  }
  private def getShortDesc(content: String): Option[String] = simpleMatch(content, "<p class=\"short-description\">(.*)</p>")
  private def getRating(content: String): Option[Rating] = simpleMatch(content, "<li class='current-rating' id='current-rating' style=\"width:([^p]*)px\"></li>").map(r => new Rating(r.toDouble / 25, 5))
  private def getprice(content: String): Option[Price] = Utils.sequence(doubleMatch(content, "<div class=\"prix\">\n *([0-9,]+) (.)\n *</div>")).map { case (value, currency) => new Price(value.replace(",", ".").toDouble, currency) }
  private def getAdditives(content: String): Option[List[PrixingAdditive]] = {
    val ret = doubleMatchMulti(content, "<a href=\"#\" onclick=\"show_modal\\('/additives/([0-9]*)/show'\\)\">([^<]*)</a><br/>")
      .map(elt => elt.map {
        case (id, name) =>
          if (name.isDefined)
            Some(new PrixingAdditive(id, name.get.split(" ")(0).toLowerCase(), name.get, id.map(str => "http://www.prixing.fr/additives/" + str + "/show")))
          else
            None
      }).map(list => list.flatten)
    ret
  }
  private def getAllergenes(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Allergènes</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getComposition(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Composition</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getDescription(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Description</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getEnergy(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Valeur énergétique</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getExtra(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Extra</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getHelp(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Conseils</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getInformations(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Informations</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getInformationsGlobal(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Information générale</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getIngredients(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Ingrédients</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutrition(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Données nutritionelles</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutrition100(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Données nutritionnelles \\(100g/ml\\)</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutritionnel(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Nutritionnel</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutritionnel2(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Valeurs Nutritionnels</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getOrigine(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Origine</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getPresentation(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Présentation</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getQuantity(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Contenance</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getTips(content: String): Option[String] = simpleMatch(content, "(?i)<h4>Renseignements pratiques</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getOpinionRating(content: String): Option[Rating] = simpleMatch(content, "Avis : ([0-9\\.]+)").map(r => new Rating(r.toDouble, 5))
  private def getOpinions(content: String): Option[List[PrixingOpinion]] = {
    val matcher = (
      " *<div class=\"avis-titre\">\n" +
      " *<h3>\n *(.*)\n *</h3>\n" +
      " *<span class=\"date\">Le (.*)</span>\n" +
      " *<p class=\"avis\">\n" +
      "( *<img alt=\"Star\" height=\"21\" src=\"/images/star.png\" width=\"21\" />\n)?" +
      "( *<img alt=\"Star\" height=\"21\" src=\"/images/star.png\" width=\"21\" />\n)?" +
      "( *<img alt=\"Star\" height=\"21\" src=\"/images/star.png\" width=\"21\" />\n)?" +
      "( *<img alt=\"Star\" height=\"21\" src=\"/images/star.png\" width=\"21\" />\n)?" +
      "( *<img alt=\"Star\" height=\"21\" src=\"/images/star.png\" width=\"21\" />\n)?" +
      "( *<img alt=\"Star_white\" height=\"21\" src=\"/images/star_white.png\" width=\"21\" />\n)*" +
      " *</p>\n" +
      " *</div>\n" +
      " *<div class=\"avis-content\">\n *<p>\n *(.*)\n *</p>\n *</div>").r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(name, date, v1, v2, v3, v4, v5, vOther, comment) =>
        new PrixingOpinion(Utils.trim(name), Utils.trim(date), Utils.toDate(date, "dd/MM/yyyy"), getOpinionRating(v1, v2, v3, v4, v5), Utils.trim(comment))
    }.toList
    Utils.notEmpty(res)
  }
  private def getOpinionRating(v1: String, v2: String, v3: String, v4: String, v5: String): Int = {
    if (v5 != null) 5
    else if (v4 != null) 4
    else if (v3 != null) 3
    else if (v2 != null) 2
    else if (v1 != null) 1
    else 0
  }

  private def doubleMatchMulti(content: String, regex: String): Option[List[(Option[String], Option[String])]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(val1, val2) => (Utils.toOpt(val1), Utils.toOpt(val2))
      case _ => (None, None)
    }.toList.filter(str => str._1.isDefined || str._2.isDefined)
    Utils.notEmpty(res)
  }
  private def simpleMatchMulti(content: String, regex: String): Option[List[String]] = {
    val matcher = regex.r.unanchored
    val res = matcher.findAllIn(content).map {
      case matcher(value) => Utils.toOpt(value)
      case _ => None
    }.toList.flatten
    Utils.notEmpty(res)
  }
  private def doubleMatch(content: String, regex: String): (Option[String], Option[String]) = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(val1, val2) => (Utils.toOpt(val1), Utils.toOpt(val2))
      case _ => (None, None)
    }
  }
  private def simpleMatch(content: String, regex: String): Option[String] = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(value) => Utils.toOpt(value)
      case _ => None
    }
  }
}