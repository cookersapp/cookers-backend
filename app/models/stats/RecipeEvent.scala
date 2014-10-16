package models.stats

import play.api.libs.functional.syntax.functionalCanBuildApplicative
import play.api.libs.functional.syntax.toFunctionalBuilderOps

case class RecipeEvent(
  time: Long,
  name: String,
  user: String,
  recipe: String,
  index: Int)

object RecipeEvent {
  import play.api.libs.json.Json

  implicit val recipeEventFormat = Json.format[RecipeEvent]
}
