'use strict';

angular.module('app')

.factory('Calculator', function(){
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

  function ingredientPrice(ingredient, food){
    var price = _getPriceForQuantity(food.prices, ingredient.quantity);
    if(price === null){
      console.warn('Unable to get price for ingredient', ingredient);
      console.warn('And food', food);
      console.warn('With conversion rules', unitConversion);
      alert('Unable to get price for '+ingredient.food.name+' :(');
      return {value: 0, currency: '?'};
    } else {
      return price;
    }
  }

  function recipePrice(recipe){
    var totalPrice = 0, recipeCurrency = '€';
    // sum ingredient prices
    if(recipe && recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        if(ingredient.price){
          if(recipeCurrency !== ingredient.price.currency){
            console.warn('Ingredient currency ('+ingredient.food.name+' / '+ingredient.price.currency+') does not match with recipe currency ('+recipe.name+' / '+recipeCurrency+')', recipe);
            alert('Currency mismatch between recipe ('+recipe.name+' / '+recipeCurrency+') and ingredient ('+ingredient.food.name+' / '+ingredient.price.currency+')');
          } else {
            totalPrice += ingredient.price.value;
          }
        } else {
          console.warn('Ingredient '+ingredient.food.name+' of recipe '+recipe.name+' does not has price !', recipe);
          alert('Ingredient '+ingredient.food.name+' of recipe '+recipe.name+' does not has price !');
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
      console.warn('Recipe '+recipe.name+' does not have servings !!!', recipe);
      alert('Recipe '+recipe.name+' does not have servings !!!');
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
      }
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
              }
            }
          }
        }
      }
      return null;
    }
  }

  return service;
});
