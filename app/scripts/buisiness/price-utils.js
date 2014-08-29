'use strict';

angular.module('app')

.factory('Calculator', function($window){
  var service = {
    ingredientPrice: ingredientPrice,
    recipePrice: recipePrice
  };

  var unitConversion = [
    {ref: 'g', convert: [
      {unit: 'g', factor: 1},
      {unit: 'kg', factor: 1000}
    ]},
    {ref: 'ml', convert: [
      {unit: 'cl', factor: 10},
      {unit: 'litre', factor: 1000}
    ]}
  ];

  function ingredientPrice(ingredient, food, _errors, _ctx){
    var price = _getPriceForQuantity(food.prices, ingredient.quantity);
    if(price === null){
      var err = {
        message: 'Unable to get price for ingredient <'+ingredient.food.name+'>'+(_ctx && _ctx.recipe ? ' in recipe <'+_ctx.recipe.name+'>' : ''),
        ingredient: angular.copy(ingredient),
        food: angular.copy(food)
      };
      if(_ctx && _ctx.recipe){err.recipe = angular.copy(_ctx.recipe);}
      console.warn(err.message, err);
      if(_errors) { _errors.push(err);  }
      else        { $window.alert(err.message); }
      return {value: 0, currency: '?'};
    } else {
      return price;
    }
  }

  function recipePrice(recipe, _errors){
    var totalPrice = 0, recipeCurrency = '€', err;
    // sum ingredient prices
    if(recipe && recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        if(ingredient.price){
          if(ingredient.price.value !== 0){
            if(ingredient.price.currency === recipeCurrency){
              totalPrice += ingredient.price.value;
            } else {
              err = {
                message: 'Currency mismatch between recipe <'+recipe.name+'> ('+recipeCurrency+') and ingredient <'+ingredient.food.name+'> ('+ingredient.price.currency+')',
                recipe: angular.copy(recipe),
                ingredient: angular.copy(ingredient)
              };
              console.warn(err.message, err);
              if(_errors) { _errors.push(err);  }
              else        { $window.alert(err.message); }
            }
          }
        } else {
          err = {
            message: 'Ingredient <'+ingredient.food.name+'> of recipe <'+recipe.name+'> does not has price !',
            recipe: angular.copy(recipe),
            ingredient: angular.copy(ingredient)
          };
          console.warn(err.message, err);
          if(_errors) { _errors.push(err);  }
          else        { $window.alert(err.message); }
        }
      }
    }

    if(recipe && recipe.servings){
      return {
        value: totalPrice/recipe.servings.value,
        currency: recipeCurrency,
        unit: recipe.servings.unit
      };
    } else {
      err = {
        message: 'Recipe <'+recipe.name+'> does not have servings !!!',
        recipe: angular.copy(recipe)
      };
      console.warn(err.message, err);
      if(_errors) { _errors.push(err);  }
      else        { $window.alert(err.message); }
      return {
        value: totalPrice,
        currency: recipeCurrency,
        unit: null
      };
    }
  }

  function _getPriceForQuantity(prices, quantity){
    var price = _.find(prices, {unit: quantity.unit});
    if(price){
      return {
        currency: price.currency,
        value: price.value * quantity.value
      };
    } else {
      // TODO : add conversion rules to food objects (for pièce for example)
      for(var i in unitConversion){
        var src = _.find(unitConversion[i].convert, {unit: quantity.unit});
        if(src){
          for(var j in prices){
            var dest = _.find(unitConversion[i].convert, {unit: prices[j].unit});
            if(dest){
              return {
                currency: prices[j].currency,
                value: prices[j].value * quantity.value * (src.factor / dest.factor)
              };
            }
          }
        }
      }
      return null;
    }
  }

  return service;
});
