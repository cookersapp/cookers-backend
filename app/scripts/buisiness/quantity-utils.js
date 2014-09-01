angular.module('app')

.factory('QuantityCalculator', function(){
  'use strict';
  var service = {
    addIngredients: addIngredients
  };

  function addIngredients(ingredients, _errors, _ctx){
    if(Array.isArray(ingredients) && ingredients.length > 0){
      var ing = angular.copy(ingredients[0]);
      for(var i=1; i<ingredients.length; i++){
        if(ing.quantity.unit === ingredients[i].quantity.unit){
          ing.quantity.value += ingredients[i].quantity.value;
        } else {
          var err = {
            message: 'Can\'t add quantity <'+ingredients[0].quantity.unit+'> with quantity <'+ingredients[i].quantity.unit+'> for ingredient <'+ingredients[0].food.name+'>'+(_ctx && _ctx.selection ? ' in selection <'+_ctx.selection.id+'>' : '')+' !',
            ingredientSource: angular.copy(ingredients[0]),
            ingredientAdded: angular.copy(ingredients[i])
          };
          if(_ctx && _ctx.selection){err.selection = angular.copy(_ctx.selection);}
          console.warn(err.message, err);
          if(_errors) { _errors.push(err);  }
          else        { $window.alert(err.message); }
        }
      }
    }
  }

  return service;
});
