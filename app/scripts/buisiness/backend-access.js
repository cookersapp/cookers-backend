'use strict';

angular.module('app')

.factory('RecipeSrv', function(DataSrvBuilder, Calculator, Utils){
  function process(formRecipe, foods){
    var recipe = angular.copy(formRecipe);
    if(!recipe.id){recipe.id = Utils.createUuid();}
    if(!recipe.created){recipe.created = Date.now();}
    recipe.updated = Date.now();
    recipe.name = recipe.name ? recipe.name.toLowerCase() : '';
    recipe.slug = getSlug(recipe.name);
    delete recipe.difficulty;
    if(recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        var foodObj = _.find(foods, {id: ingredient.food.id});
        angular.copy(foodObj, ingredient.food);
        ingredient.price = Calculator.ingredientPrice(ingredient, foodObj);
        delete ingredient.food.created;
        delete ingredient.food.updated;
        delete ingredient.food.prices;
      }
    }
    recipe.price = Calculator.recipePrice(recipe);
    return recipe;
  }
  
  return DataSrvBuilder.createDataService('recipes', process);
})

.factory('FoodSrv', function(DataSrvBuilder){
  function process(formFood){
    // TODO : implement this method !
    return angular.copy(formFood);
  }
  return DataSrvBuilder.createDataService('foods', process);
})

.factory('SelectionSrv', function(DataSrvBuilder){
  function process(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.created){selection.created = Date.now();}
    selection.updated = Date.now();
    selection.id = selection.week.toString();
    return selection;
  }
  
  return DataSrvBuilder.createDataService('weekrecipes', process);
})

.factory('DataSrvBuilder', function($q, $http, firebaseUrl, Calculator, Utils){
  var service = {
    createDataService: createDataService
  };

  function createDataService(dataName, processDataFn){
    var service = {
      cache: [],
      getAll: getAll,
      get: get,
      save: save,
      remove: remove,
      process: processDataFn,
      getUrl: getUrl
    };
    var collectionUrl = firebaseUrl+'/'+dataName;
    var collectionRef = new Firebase(collectionUrl);

    function getAll(){
      return $http.get(getUrl()).then(_getDataArray).then(function(data){
        service.cache = data;
        return data;
      });
    }

    function get(id){
      return $http.get(getUrl(id)).then(_getData);
    }

    function save(data){
      var defer = $q.defer();
      if(data && data.id){
        collectionRef.child(data.id).set(angular.copy(data), function(error){
          if(error){
            console.log('Error', error);
            defer.reject(error);
          } else {
            defer.resolve();
          }
        });
      } else {
        defer.reject({
          message: 'Wrong argument !',
          data: data
        });
      }
      return defer.promise;
    }

    function remove(data){
      var defer = $q.defer();
      if(data && data.id){
        collectionRef.child(data.id).remove(function(error){
          if(error){
            console.log('Error', error);
            defer.reject(error);
          } else {
            defer.resolve();
          }
        });
      } else {
        defer.reject({
          message: 'Wrong argument !',
          data: data
        });
      }
      return defer.promise;
    }

    function getUrl(id){
      if(id)  { return collectionUrl+'/'+id+'.json';  }
      else    { return collectionUrl+'.json';         }
    }

    return service;
  }

  function _getData(result){
    return result.data !== 'null' ? result.data : null;
  }

  function _getDataArray(result){
    var arr = [];
    if(result && result.data && typeof result.data === 'object'){
      for(var i in result.data){
        arr.push(result.data[i]);
      }
    }
    return arr;
  }

  return service;
});