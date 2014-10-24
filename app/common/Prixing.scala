package common

import models.Product
import models.Quantity
import dao.ProductsDao
import java.util.Date
import java.text.SimpleDateFormat
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.ws._
import reactivemongo.api.DB

case class PrixingProductInfo(
  allergenes: String,
  composition: String,
  description: String,
  energy: String,
  extra: String,
  help: String,
  informations: String,
  informationsGlobal: String,
  ingredients: String,
  nutrition: String,
  nutrition100: String,
  nutritionnel: String,
  nutritionnel2: String,
  origine: String,
  presentation: String,
  quantity: String,
  tips: String)
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

case class PrixingOpinions(
  rating: Double,
  opinions: List[PrixingOpinion])
object PrixingOpinions {
  implicit val prixingOpinionsFormat = Json.format[PrixingOpinions]
}

case class PrixingPrice(
  value: Double,
  currency: String)
object PrixingPrice {
  implicit val prixingPriceFormat = Json.format[PrixingPrice]
}

case class PrixingAdditive(
  id: String,
  name: String,
  fullName: String,
  url: String)
object PrixingAdditive {
  implicit val prixingAdditiveFormat = Json.format[PrixingAdditive]
}

case class PrixingProduct(
  barcode: String,
  name: String,
  images: List[String],
  category: String,
  categoryUrl: String,
  shortDescription: String,
  rating: Double,
  price: PrixingPrice,
  additives: List[PrixingAdditive],
  infos: PrixingProductInfo,
  opinions: PrixingOpinions)
object PrixingProduct {
  implicit val prixingProductFormat = Json.format[PrixingProduct]
}

object Prixing {
  def getProduct(barcode: String)(implicit db: DB): Future[Option[PrixingProduct]] = {
    ProductsDao.getP(barcode).flatMap { opt =>
      if (opt.isDefined) {
        Future.successful(create(barcode, opt.get))
      } else {
        WS.url("http://www.prixing.fr/products/" + barcode).get().map { response =>
          val productOpt = create(barcode, response.body)
          if (productOpt.isDefined) {
            ProductsDao.insertP(barcode, response.body)
          }
          productOpt
        }
      }
    }
  }

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
    val category = getCategory(content)
    val shortDescription = getShortDesc(content)
    val rating = getRating(content)
    val price = getprice(content)
    val additives = getAdditives(content)
    val opinionRating = getOpinionRating(content)
    val opinionList = getOpinions(content)
    val opinions = new PrixingOpinions(opinionRating, opinionList)
    val product = new PrixingProduct(barcode, name, images, category._2, category._1, shortDescription, rating, price, additives, infos, opinions)

    if (product.name != "" && product.images.length > 0) Some(product)
    else None
  }

  private def getName(content: String): String = simpleMatch(content, "<h1>(.*)</h1>")
  private def getImages(content: String): List[String] = simpleMatchMulti(content, "<img alt=\"\" class=\"img-produit\" src=\"([^\"]*)\" />").map(rel => "http://www.prixing.fr" + rel)
  private def getCategory(content: String): (String, String) = {
    val res = doubleMatch(content, "<a href=\"/products/categories/([^\"]*)\">([^<]*)</a>")
    if (res._1 == "") res
    else ("http://www.prixing.fr/products/categories/" + res._1, res._2)
  }
  private def getShortDesc(content: String): String = simpleMatch(content, "<p class=\"short-description\">(.*)</p>")
  private def getRating(content: String): Double = {
    val res = simpleMatch(content, "<li class='current-rating' id='current-rating' style=\"width:([^p]*)px\"></li>")
    if (res == "") Utils.NaN else res.toDouble / 25
  }
  private def getprice(content: String): PrixingPrice = {
    val res = doubleMatch(content, "<div class=\"prix\">\n *([0-9,]+) (.)\n *</div>")
    if (res._1 == "") new PrixingPrice(Utils.NaN, "")
    else new PrixingPrice(res._1.replace(",", ".").toDouble, res._2)
  }
  private def getAdditives(content: String): List[PrixingAdditive] = {
    val res = doubleMatchMulti(content, "<a href=\"#\" onclick=\"show_modal\\('/additives/([0-9]*)/show'\\)\">([^<]*)</a><br/>")
    res.map { case (id, name) => new PrixingAdditive(id, name.split(" ")(0).toLowerCase(), name, "http://www.prixing.fr/additives/" + id + "/show") }
  }
  private def getAllergenes(content: String): String = simpleMatch(content, "(?i)<h4>Allergènes</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getComposition(content: String): String = simpleMatch(content, "(?i)<h4>Composition</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getDescription(content: String): String = simpleMatch(content, "(?i)<h4>Description</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getEnergy(content: String): String = simpleMatch(content, "(?i)<h4>Valeur énergétique</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getExtra(content: String): String = simpleMatch(content, "(?i)<h4>Extra</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getHelp(content: String): String = simpleMatch(content, "(?i)<h4>Conseils</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getInformations(content: String): String = simpleMatch(content, "(?i)<h4>Informations</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getInformationsGlobal(content: String): String = simpleMatch(content, "(?i)<h4>Information générale</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getIngredients(content: String): String = simpleMatch(content, "(?i)<h4>Ingrédients</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutrition(content: String): String = simpleMatch(content, "(?i)<h4>Données nutritionelles</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutrition100(content: String): String = simpleMatch(content, "(?i)<h4>Données nutritionnelles \\(100g/ml\\)</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutritionnel(content: String): String = simpleMatch(content, "(?i)<h4>Nutritionnel</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getNutritionnel2(content: String): String = simpleMatch(content, "(?i)<h4>Valeurs Nutritionnels</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getOrigine(content: String): String = simpleMatch(content, "(?i)<h4>Origine</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getPresentation(content: String): String = simpleMatch(content, "(?i)<h4>Présentation</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getQuantity(content: String): String = simpleMatch(content, "(?i)<h4>Contenance</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getTips(content: String): String = simpleMatch(content, "(?i)<h4>Renseignements pratiques</h4>\n *<div class=\"pDescription\"><span>(.*)</span></div>")
  private def getOpinionRating(content: String): Double = {
    val res = simpleMatch(content, "Avis : ([0-9\\.]+)")
    if (res == "") Utils.NaN else res.toDouble
  }
  private def getOpinions(content: String): List[PrixingOpinion] = {
    val dateFormat = new SimpleDateFormat("dd/MM/yyyy")
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
    matcher.findAllIn(content).map {
      case matcher(name, date, v1, v2, v3, v4, v5, vOther, comment) => new PrixingOpinion(name.trim(), date.trim(), dateFormat.parse(date.trim()), getOpinionRating(v1, v2, v3, v4, v5), comment.trim())
    }.toList
  }
  private def getOpinionRating(v1: String, v2: String, v3: String, v4: String, v5: String): Int = {
    if (v5 != null) 5
    else if (v4 != null) 4
    else if (v3 != null) 3
    else if (v2 != null) 2
    else if (v1 != null) 1
    else 0
  }

  private def doubleMatchMulti(content: String, regex: String): List[(String, String)] = {
    val matcher = regex.r.unanchored
    matcher.findAllIn(content).map {
      case matcher(val1, val2) => (val1.trim(), val2.trim())
    }.toList
  }
  private def simpleMatchMulti(content: String, regex: String): List[String] = {
    val matcher = regex.r.unanchored
    matcher.findAllIn(content).map {
      case matcher(value) => value.trim()
    }.toList
  }
  private def doubleMatch(content: String, regex: String): (String, String) = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(val1, val2) => (val1.trim(), val2.trim())
      case _ => ("", "")
    }
  }
  private def simpleMatch(content: String, regex: String): String = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(value) => value.trim()
      case _ => ""
    }
  }
}