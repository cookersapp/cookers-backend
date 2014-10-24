package common

import models.Product
import models.Quantity
import dao.ProductsDao
import java.io.PrintWriter
import java.io.File
import scala.io.Source
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws._
import reactivemongo.api.DB

object Prixing {
  def getProduct(barcode: String)(implicit db: DB): Future[Option[Product]] = {
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

  def create(barcode: String, content: String): Option[Product] = {
    val name = getName(content)
    val genericName = ""
    val quantityStr = getQuantity(content)
    val quantity = Quantity.create(quantityStr)
    val brand = ""
    val category = getCategory(content)._2
    val images = getImages(content)
    val image = if (images.length > 0) images.head else ""
    val imageSmall = ""

    if (barcode != "" && name != "" && image != "") Some(new Product(barcode, name, genericName, quantityStr, quantity, brand, category, image, imageSmall, "prixing"))
    else None
  }

  private def getName(content: String): String = simpleMatch(content, "<h1>(.*)</h1>")
  private def getImages(content: String): List[String] = simpleMatchMulti(content, "<img alt=\"\" class=\"img-produit\" src=\"([^\"]*)\" />")
  private def getCategory(content: String): (String, String) = {
    val res = doubleMatch(content, "<a href=\"/products/categories/([^\"]*)\">([^<]*)</a>")
    if (res._1 == "") res
    else ("http://www.prixing.fr/products/categories/" + res._1, res._2)
  }
  private def getShortDesc(content: String): String = simpleMatch(content, "<p class=\"short-description\">(.*)</p>")
  private def getRating(content: String): Double = {
    val res = simpleMatch(content, "<li class='current-rating' id='current-rating' style=\"width:([^p]*)px\"></li>")
    if (res == "") Double.NaN else res.toDouble / 25
  }
  private def getRating2(content: String): Double = {
    val res = simpleMatch(content, "Avis : ([0-9\\.]+)")
    if (res == "") Double.NaN else res.toDouble
  }
  private def getprice(content: String): (Double, String) = {
    val res = doubleMatch(content, "<div class=\"prix\">\n *([0-9,]+) (.)\n *</div>")
    if (res._1 == "") (Double.NaN, "")
    else (res._1.replace(",", ".").toDouble, res._2)
  }
  private def getAdditives(content: String): List[(String, String, String)] = {
    val res = doubleMatchMulti(content, "<a href=\"#\" onclick=\"show_modal\\('/additives/([0-9]*)/show'\\)\">([^<]*)</a><br/>")
    res.map { case (id, name) => (id, name, "http://www.prixing.fr/additives/" + id + "/show") }
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