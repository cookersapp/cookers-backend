angular.module('firebaseAdminApp')

.factory('foodDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('foods', true);
})

.factory('productDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('products', true);
})

.factory('recipeDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('recipes', true);
})

.factory('weekrecipeDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('weekrecipes', true);
})

.factory('mealDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('meals', true);
})

.factory('planningDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('plannings', true);
})

.factory('globalmessageDb', function(firebaseFactory){
  'use strict';
  return firebaseFactory.createCollection('globalmessages', false);
})

.factory('priceCalculator', function(foodDb, unitConversion){
  'use strict';
  var foods = foodDb.collection;
  var currency = '€';
  var service = {
    forIngredient: ingredientPrice,
    forRecipe: recipePrice
  };

  function getPriceForQuantity(quantity, prices){
    var price = _.find(prices, {unit: quantity.unit});
    if(price){
      return price.value * quantity.value;
    } else {
      for(var i in unitConversion){
        var src = _.find(unitConversion[i].convert, {unit: quantity.unit});
        if(src){
          for(var j in prices){
            var dest = _.find(unitConversion[i].convert, {unit: prices[j].unit});
            if(dest){
              return prices[j].value * quantity.value * (src.factor / dest.factor);
            }
          }
        }
      }
      console.warn('Unable to find price for <'+quantity.unit+'> in ', prices);
      return 0;
    }
  }

  function ingredientPrice(ingredient){
    return {
      value: getPriceForQuantity(ingredient.quantity, ingredient.food.prices),
      currency: currency
    };
  }

  function recipePrice(recipe){
    var totalPrice = 0;
    if(recipe && recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        var food = _.find(foods, {id: ingredient.food.id});
        if(food){
          totalPrice += getPriceForQuantity(ingredient.quantity, food.prices);
        }
      }
    }

    if(recipe && recipe.servings){
      return {
        value: totalPrice/recipe.servings.value,
        currency: currency,
        unit: recipe.servings.unit
      };
    } else {
      return {
        value: totalPrice,
        currency: currency,
        unit: null
      };
    }
  }

  return service;
})

.factory('formProcess', function(priceCalculator){
  'use strict';
  return {
    food: function(formFood){
      return angular.copy(formFood);
    },
    product: function(formProduct, foods){
      var product = angular.copy(formProduct);
      var foodObj = _.find(foods, {id: product.food.id});
      angular.copy(foodObj, product.food);
      return product;
    },
    recipe: function(formRecipe, foods){
      var recipe = angular.copy(formRecipe);
      if(recipe.ingredients){
        for(var i in recipe.ingredients){
          var ingredient = recipe.ingredients[i];
          var foodObj = _.find(foods, {id: ingredient.food.id});
          angular.copy(foodObj, ingredient.food);
          ingredient.price = priceCalculator.forIngredient(ingredient);
        }
      }
      recipe.price = priceCalculator.forRecipe(recipe);
      return recipe;
    },
    weekrecipe: function(formWeekrecipe, recipes){
      var weekrecipe = angular.copy(formWeekrecipe);
      weekrecipe.price = {
        value: 0,
        currency: '€',
        unit: 'personnes'
      };
      for(var i in weekrecipe.recipes){
        var recipe = weekrecipe.recipes[i];
        var r = _.find(recipes, {id: recipe.id});
        angular.copy(r, recipe);
        weekrecipe.price.value += recipe.price.value;
      }
      return weekrecipe;
    },
    meal: function(formMeal, recipes){
      var meal = angular.copy(formMeal);
      var mealRecipes = [meal.starter, meal.mainCourse, meal.desert, meal.wine];
      meal.difficulty = 0;
      meal.price = {
        value: 0,
        currency: '€',
        unit: 'personnes'
      };
      for(var i in mealRecipes){
        var recipe = mealRecipes[i];
        if(recipe){
          if(recipe.id && recipe.id.length > 0){
            var r = _.find(recipes, {id: recipe.id});
            angular.copy(r, recipe);
          } else {
            angular.copy({}, recipe);
          }

          if(recipe.difficulty && recipe.difficulty > meal.difficulty){
            meal.difficulty = recipe.difficulty;
          }
          if(recipe.price && recipe.price.value){
            meal.price.value += recipe.price.value;
          }
        }
      }
      return meal;
    },
    planning: function(formPlanning, meals){
      var planning = angular.copy(formPlanning);
      planning.meals = [];
      planning.price = {
        value: 0,
        currency: '€',
        unit: 'personnes'
      };
      for(var i in planning.days){
        var dayMeals = [planning.days[i].lunch, planning.days[i].dinner];
        for(var j in dayMeals){
          var meal = dayMeals[j];
          if(meal && meal.recommended && meal.recommended.length > 0){
            var index = _.findIndex(planning.meals, {id: meal.recommended});
            if(index === -1){
              var m = _.find(meals, {id: meal.recommended});
              planning.meals.push(angular.copy(m));
              planning.price.value += m.price.value;
            } else {
              planning.price.value += planning.meals[index].price.value;
            }
          }
        }
      }
      return planning;
    }
  };
});