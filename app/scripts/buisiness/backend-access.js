'use strict';

angular.module('app')

.factory('FoodSrv', function(DataSrvBuilder){
  function process(formFood){
    var food = angular.copy(formFood);
    DataSrvBuilder.preprocessData(food);
    return food;
  }
  return DataSrvBuilder.createDataService('foods', process);
})

.factory('RecipeSrv', function(DataSrvBuilder, Calculator){
  function process(formRecipe, foods){
    var recipe = angular.copy(formRecipe);
    DataSrvBuilder.preprocessData(recipe);
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

.factory('SelectionSrv', function(DataSrvBuilder){
  function process(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    DataSrvBuilder.preprocessData(selection);
    return selection;
  }
  
  return DataSrvBuilder.createDataService('weekrecipes', process);
})

.factory('DataSrvBuilder', function($q, $http, firebaseUrl, Calculator, Utils){
  var service = {
    preprocessData: preprocessData,
    createDataService: createDataService
  };
  
  function preprocessData(data){
    if(!data.id){data.id = Utils.createUuid();}
    if(!data.created){data.created = Date.now();}
    data.updated = Date.now();
    if(data.name){data.name = data.name.toLowerCase();}
    if(data.name){data.slug = getSlug(data.name);}
  }

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