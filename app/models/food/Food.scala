package models.food

import common.Utils
import models.food.dataImport.FirebaseFood
import play.api.libs.json._

case class FoodCategory(
  id: String,
  order: Int,
  name: String,
  slug: String) {
  def this(id: String, order: Int, name: String) = this(id, order, name, Utils.toSlug(name))
}
object FoodCategory {
  implicit val foodCategoryFormat = Json.format[FoodCategory]

  def from(name: String): FoodCategory = name match {
    case "Fruits & Légumes" => new FoodCategory("1", 1, name)
    case "Viandes & Poissons" => new FoodCategory("2", 2, name)
    case "Frais" => new FoodCategory("3", 3, name)
    case "Pains & Pâtisseries" => new FoodCategory("4", 4, name)
    case "Épicerie salée" => new FoodCategory("5", 5, name)
    case "Épicerie sucrée" => new FoodCategory("6", 6, name)
    case "Boissons" => new FoodCategory("7", 7, name)
    case "Bio" => new FoodCategory("8", 8, name)
    case "Bébé" => new FoodCategory("9", 9, name)
    case "Hygiène & Beauté" => new FoodCategory("10", 10, name)
    case "Entretien & Nettoyage" => new FoodCategory("11", 11, name)
    case "Animalerie" => new FoodCategory("12", 12, name)
    case "Bazar & Textile" => new FoodCategory("13", 13, name)
    case "Surgelés" => new FoodCategory("14", 14, name)
    case "Autres" => new FoodCategory("15", 15, "Autres")
  }
}

case class Food(
  id: String,
  name: String,
  slug: String,
  category: FoodCategory,
  prices: Option[List[PriceQuantity]],
  created: Long,
  updated: Long)
object Food {
  implicit val foodFormat = Json.format[Food]

  def from(foodOpt: Option[FirebaseFood]): Option[Food] = {
    if (foodOpt.isDefined) {
      val food = foodOpt.get
      val id = food.id
      val name = food.name
      val slug = Utils.toSlug(food.name)
      val category = FoodCategory.from(food.category)
      val prices = food.prices.map(_.map(p => new PriceQuantity(p.value, p.currency, p.unit)))
      val created = food.created
      val updated = food.updated.getOrElse(food.created)
      Some(new Food(id, name, slug, category, prices, created, updated))
    } else {
      None
    }
  }
}
