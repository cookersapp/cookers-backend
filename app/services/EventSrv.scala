package services

import models.Event
import models.food.dataImport.CookersProduct
import dao.UsersDao
import dao.ProductsDao
import reactivemongo.api.DB

object EventSrv {
  def aggregateData(event: Event)(implicit db: DB) = {
    val appVersion = event.appVersion.getOrElse(event.source.flatMap(json => (json \ "appVersion").asOpt[String]).getOrElse(""))
    UsersDao.userSeen(event.user, appVersion)
    if ("cart-product-scanned".equals(event.name)) {
      val barcodeOpt = event.data.flatMap(json => (json \ "barcode").asOpt[String])
      val item = event.data.flatMap(json => (json \ "item").asOpt[String]).getOrElse(CookersProduct.defaultFoodId)
      barcodeOpt.map { barcode =>
        ProductsDao.scanned(barcode, item)
        UsersDao.userScan(event.user, barcode)
      }
    }
  }
}