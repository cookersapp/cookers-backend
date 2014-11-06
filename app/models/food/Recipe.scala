package models.food

import models.food.dataImport.FirebaseRecipe
import models.food.dataImport.FirebaseRecipeIngredient
import models.food.dataImport.FirebaseRecipeIngredientFood
import models.food.dataImport.FirebaseRecipeTool
import models.food.dataImport.FirebaseRecipeInstruction
import models.food.dataImport.FirebaseRecipeTimer
import models.food.dataImport.FirebaseRecipeTimes
import play.api.libs.json._

case class RecipeTimes(
  preparation: Int,
  cooking: Int,
  eat: Int,
  unit: String)
object RecipeTimes {
  implicit val recipeTimesFormat = Json.format[RecipeTimes]

  def from(time: FirebaseRecipeTimes): RecipeTimes = {
    val preparation = time.preparation
    val cooking = time.cooking
    val eat = time.eat
    val unit = time.unit
    new RecipeTimes(preparation, cooking, eat, unit)
  }
}

case class RecipeTimer(
  color: String,
  label: Option[String],
  seconds: Option[Int])
object RecipeTimer {
  implicit val recipeTimerFormat = Json.format[RecipeTimer]

  def from(timer: FirebaseRecipeTimer): RecipeTimer = {
    val color = timer.color
    val label = timer.label
    val seconds = timer.seconds
    new RecipeTimer(color, label, seconds)
  }
}

case class RecipeInstruction(
  title: Option[String],
  summary: Option[String],
  content: String,
  timers: Option[List[RecipeTimer]])
object RecipeInstruction {
  implicit val recipeInstructionFormat = Json.format[RecipeInstruction]

  def from(instruction: FirebaseRecipeInstruction): RecipeInstruction = {
    val title = instruction.title
    val summary = instruction.summary
    val content = instruction.content
    val timers = instruction.timers.map(_.map(t => RecipeTimer.from(t)))
    new RecipeInstruction(title, summary, content, timers)
  }
}

case class RecipeTool(
  name: String)
object RecipeTool {
  implicit val recipeToolFormat = Json.format[RecipeTool]

  def from(tool: FirebaseRecipeTool): RecipeTool = {
    val name = tool.name
    new RecipeTool(name)
  }
}

case class RecipeIngredientFood(
  id: String,
  name: String,
  slug: Option[String],
  category: String)
object RecipeIngredientFood {
  implicit val recipeIngredientFoodFormat = Json.format[RecipeIngredientFood]

  def from(food: FirebaseRecipeIngredientFood): RecipeIngredientFood = {
    val id = food.id
    val name = food.name
    val slug = food.slug
    val category = food.category
    new RecipeIngredientFood(id, name, slug, category)
  }
}

case class RecipeIngredient(
  role: String,
  quantity: Quantity,
  pre: Option[String],
  food: RecipeIngredientFood,
  post: Option[String],
  price: Price)
object RecipeIngredient {
  implicit val recipeIngredientFormat = Json.format[RecipeIngredient]

  def from(ingredient: FirebaseRecipeIngredient): RecipeIngredient = {
    val role = ingredient.role
    val quantity = ingredient.quantity
    val pre = ingredient.pre
    val food = RecipeIngredientFood.from(ingredient.food)
    val post = ingredient.post
    val price = ingredient.price
    new RecipeIngredient(role, quantity, pre, food, post, price)
  }
}

case class Recipe(
  id: String,
  name: String,
  slug: String,
  category: String,
  images: Option[Map[String, String]],
  price: PriceQuantity,
  ingredients: List[RecipeIngredient],
  tools: Option[List[RecipeTool]],
  instructions: List[RecipeInstruction],
  servings: Quantity,
  time: RecipeTimes,
  source: Option[String],
  privateNotes: Option[String],
  updated: Long,
  created: Long)
object Recipe {
  implicit val recipeFormat = Json.format[Recipe]

  def from(recipe: FirebaseRecipe): Recipe = {
    val id = recipe.id
    val name = recipe.name
    val slug = recipe.slug
    val category = recipe.category
    val images = recipe.images
    val price = recipe.price
    val ingredients = recipe.ingredients.map(i => RecipeIngredient.from(i))
    val tools = recipe.tools.map(_.map(t => RecipeTool.from(t)))
    val instructions = recipe.instructions.map(i => RecipeInstruction.from(i))
    val servings = recipe.servings
    val time = RecipeTimes.from(recipe.time)
    val source = recipe.source
    val privateNotes = recipe.privateNotes
    val updated = recipe.updated
    val created = recipe.created
    new Recipe(id, name, slug, category, images, price, ingredients, tools, instructions, servings, time, source, privateNotes, updated, created)
  }
}
