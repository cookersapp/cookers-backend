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
  function process(formRecipe, foods, _errors){
    var recipe = angular.copy(formRecipe);
    var _ctx = {recipe: recipe};
    DataSrvBuilder.preprocessData(recipe);
    delete recipe.difficulty;
    if(recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        var foodObj = _.find(foods, {id: ingredient.food.id});
        angular.copy(foodObj, ingredient.food);
        ingredient.price = Calculator.ingredientPrice(ingredient, foodObj, _errors, _ctx);
        delete ingredient.food.created;
        delete ingredient.food.updated;
        delete ingredient.food.prices;
      }
    }
    recipe.price = Calculator.recipePrice(recipe, _errors);
    return recipe;
  }

  return DataSrvBuilder.createDataService('recipes', process);
})

.factory('SelectionSrv', function($q, DataSrvBuilder, RecipeSrv){
  var srv1 = DataSrvBuilder.createDataService('weekrecipes', process1);
  var srv2 = DataSrvBuilder.createDataService('selections', process2);
  var service = {
    cache: [],
    get: function(id, _lazy){
      return srv2.get(id).then(function(selection){
        if(_lazy){ return selection; }
        else { return fullLoad(selection); }
      });
    },
    getAll: function(_lazy){
      return srv2.getAll().then(function(selections){
        if(_lazy){ service.cache = selections; }
        else { service.cache = fullLoadAll(selections); }
        return service.cache;
      });
    },
    save: function(data){
      srv1.save(process1(data));
      return srv2.save(process2(data));
    },
    remove: function(data){
      srv1.remove(data);
      return srv2.remove(data);
    },
    process: preProcess,
    getUrl: srv2.getUrl,
    fullLoad: fullLoad,
    fullLoadAll: fullLoadAll
  };

  function fullLoad(selection, _recipePromiseCache){
    if(selection && !selection.lazyLoaded && selection.recipes){
      selection.lazyLoaded = true;
      var recipePromises = [];
      for(var i in selection.recipes){
        recipePromises.push($q.when(selection.recipes[i].id).then(function(recipeId){
          if(_recipePromiseCache){
            if(!_recipePromiseCache[recipeId]){ _recipePromiseCache[recipeId] = RecipeSrv.get(recipeId); }
            return _recipePromiseCache[recipeId];
          } else {
            return RecipeSrv.get(recipeId);
          }
        }));
      }
      return $q.all(recipePromises).then(function(recipes){
        selection.recipes = recipes;
        return selection;
      });
    } else {
      if(selection){selection.lazyLoaded = true;}
      return $q.when(selection);
    }
  }

  function fullLoadAll(selections){
    var selectionPromises = [];
    var recipePromiseCache = [];
    for(var i in selections){
      selectionPromises.push($q.when(selections[i]).then(function(selection){
        return fullLoad(selection, recipePromiseCache);
      }));
    }
    return $q.all(selectionPromises);
  }

  function preProcess(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    DataSrvBuilder.preprocessData(selection);
    delete selection.lazyLoaded;
    return selection;
  }
  function process1(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    DataSrvBuilder.preprocessData(selection);
    delete selection.lazyLoaded;
    return selection;
  }
  function process2(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    DataSrvBuilder.preprocessData(selection);
    delete selection.lazyLoaded;
    var recipesRef = [];
    for(var i in selection.recipes){
      recipesRef.push({
        id: selection.recipes[i].id,
        name: selection.recipes[i].name
      });
    }
    selection.recipes = recipesRef;
    return selection;
  }

  return service;
})

.factory('GlobalmessageSrv', function(DataSrvBuilder){
  function process(formMessage){
    var message = angular.copy(formMessage);
    DataSrvBuilder.preprocessData(message);
    return message;
  }
  return DataSrvBuilder.createDataService('globalmessages', process);
})

.factory('DataSrvBuilder', function($q, $http, firebaseUrl, Utils, CollectionUtils){
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
      get: get,
      getAll: getAll,
      save: save,
      remove: remove,
      process: processDataFn,
      getUrl: getUrl
    };
    var collectionUrl = firebaseUrl+'/'+dataName;
    var collectionRef = new Firebase(collectionUrl);

    function get(id){
      return $http.get(getUrl(id)).then(_getData);
    }

    function getAll(){
      return $http.get(getUrl()).then(_getDataArray).then(function(elts){
        service.cache = elts;
        return elts;
      });
    }

    function save(elt){
      var defer = $q.defer();
      if(elt && elt.id){
        collectionRef.child(elt.id).set(angular.copy(elt), function(error){
          if(error){
            console.error('Error', error);
            defer.reject(error);
          } else {
            if(_.find(service.cache, {id: elt.id}) === undefined){
              service.cache.push(elt);
            } else {
              CollectionUtils.replaceWithId(service.cache, elt);
            }
            defer.resolve();
          }
        });
      } else {
        defer.reject({
          message: 'Elt to save has no id !!!',
          data: elt
        });
      }
      return defer.promise;
    }

    function remove(elt){
      var defer = $q.defer();
      if(elt && elt.id){
        collectionRef.child(elt.id).remove(function(error){
          if(error){
            console.error('Error', error);
            defer.reject(error);
          } else {
            _.remove(service.cache, {id: elt.id});
            defer.resolve();
          }
        });
      } else {
        defer.reject({
          message: 'Elt to remove has no id !!!',
          data: elt
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