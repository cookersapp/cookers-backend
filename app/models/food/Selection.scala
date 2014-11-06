package models.food

import models.food.dataImport.FirebaseSelection
import models.food.dataImport.FirebaseSelectionRecipe
import play.api.libs.json._

case class SelectionRecipe(
  id: String,
  name: String)
object SelectionRecipe {
  implicit val selectionRecipeFormat = Json.format[SelectionRecipe]

  def from(recipe: FirebaseSelectionRecipe): SelectionRecipe = {
    val id = recipe.id
    val name = recipe.name
    new SelectionRecipe(id, name)
  }
}

case class Selection(
  id: String,
  week: Int,
  recipes: List[SelectionRecipe],
  created: Long,
  updated: Long)
object Selection {
  implicit val selectionFormat = Json.format[Selection]

  def from(selection: FirebaseSelection): Selection = {
    val id = selection.id
    val week = selection.week
    val recipes = selection.recipes.map(r => SelectionRecipe.from(r))
    val created = selection.created
    val updated = selection.updated
    new Selection(id, week, recipes, created, updated)
  }
}
