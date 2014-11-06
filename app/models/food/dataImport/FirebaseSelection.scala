package models.food.dataImport

import play.api.libs.json._

case class FirebaseSelectionRecipe(
  id: String,
  name: String)
object FirebaseSelectionRecipe {
  implicit val firebaseSelectionRecipeFormat = Json.format[FirebaseSelectionRecipe]
}

case class FirebaseSelection(
  id: String,
  week: Int,
  recipes: List[FirebaseSelectionRecipe],
  updated: Long,
  created: Long)
object FirebaseSelection {
  implicit val firebaseSelectionFormat = Json.format[FirebaseSelection]
}
