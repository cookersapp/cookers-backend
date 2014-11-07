package services

import models.Event
import dao.UsersDao
import reactivemongo.api.DB
import dao.ProductsDao

object EventSrv {
  def aggregateData(event: Event)(implicit db: DB) = {
    val appVersion = event.appVersion.getOrElse(event.source.flatMap(json => (json \ "appVersion").asOpt[String]).getOrElse(""))
    UsersDao.userSeen(event.user, appVersion)
    if ("cart-product-scanned".equals(event.name)) {
      event.data.flatMap(json => (json \ "barcode").asOpt[String]).map(barcode => ProductsDao.scanned(barcode))
    }
  }
}