package models.food.dataImport

import models.food.Price
import models.food.Quantity
import models.food.PriceQuantity
import play.api.libs.json._

case class FirebaseRecipeTool(
  name: String)
object FirebaseRecipeTool {
  implicit val firebaseRecipeToolFormat = Json.format[FirebaseRecipeTool]
}

case class FirebaseRecipeTimes(
  preparation: Int,
  cooking: Int,
  eat: Int,
  unit: String)
object FirebaseRecipeTimes {
  implicit val firebaseRecipeTimesFormat = Json.format[FirebaseRecipeTimes]
}

case class FirebaseRecipeTimer(
  color: String,
  label: Option[String],
  seconds: Option[Int])
object FirebaseRecipeTimer {
  implicit val firebaseRecipeTimerFormat = Json.format[FirebaseRecipeTimer]
}

case class FirebaseRecipeInstruction(
  title: Option[String],
  summary: Option[String],
  content: String,
  timers: Option[List[FirebaseRecipeTimer]])
object FirebaseRecipeInstruction {
  implicit val firebaseRecipeInstructionFormat = Json.format[FirebaseRecipeInstruction]
}

case class FirebaseRecipeIngredientFood(
  id: String,
  name: String,
  slug: Option[String],
  category: String)
object FirebaseRecipeIngredientFood {
  implicit val firebaseRecipeIngredientFoodFormat = Json.format[FirebaseRecipeIngredientFood]
}

case class FirebaseRecipeIngredient(
  pre: Option[String],
  food: FirebaseRecipeIngredientFood,
  post: Option[String],
  price: Price,
  quantity: Quantity,
  role: String)
object FirebaseRecipeIngredient {
  implicit val firebaseRecipeIngredientFormat = Json.format[FirebaseRecipeIngredient]
}

case class FirebaseRecipe(
  id: String,
  category: String,
  name: String,
  slug: String,
  images: Option[Map[String,String]],
  price: PriceQuantity,
  ingredients: List[FirebaseRecipeIngredient],
  tools: Option[List[FirebaseRecipeTool]],
  instructions: List[FirebaseRecipeInstruction],
  servings: Quantity,
  time: FirebaseRecipeTimes,
  source: Option[String],
  privateNotes: Option[String],
  updated: Long,
  created: Long)
object FirebaseRecipe {
  implicit val firebaseRecipeFormat = Json.format[FirebaseRecipe]
}
