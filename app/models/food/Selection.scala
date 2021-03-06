package models.food

import services.FirebaseSrv
import models.food.dataImport.FirebaseSelection
import models.food.dataImport.FirebaseSelectionRecipe
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.json._

case class Selection(
  id: String,
  week: Int,
  recipes: List[Recipe],
  created: Long,
  updated: Long)
object Selection {
  implicit val selectionFormat = Json.format[Selection]

  def from(selectionOpt: Option[FirebaseSelection]): Future[Option[Selection]] = {
    if (selectionOpt.isDefined) {
      val selection = selectionOpt.get
      val id = selection.id
      val week = selection.week
      val recipesFuture = Future.sequence(selection.recipes.map(r => FirebaseSrv.fetchRecipe(r.id)))
      val created = selection.created
      val updated = selection.updated
      recipesFuture.map(recipes => Some(new Selection(id, week, recipes.flatten, created, updated)))
    } else {
      Future.successful(None)
    }
  }
}
