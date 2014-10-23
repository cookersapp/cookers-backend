angular.module('app')

.factory('FoodSrv', function(_FirebaseCrudBuilder){
  'use strict';
  function process(formFood){
    var food = angular.copy(formFood);
    _FirebaseCrudBuilder.preprocessData(food);
    return food;
  }
  return _FirebaseCrudBuilder.createDataService('foods', process);
})

.factory('RecipeSrv', function(_FirebaseCrudBuilder, PriceCalculator){
  'use strict';
  function process(formRecipe, foods, _errors){
    var recipe = angular.copy(formRecipe);
    var _ctx = {recipe: recipe};
    _FirebaseCrudBuilder.preprocessData(recipe);
    delete recipe.difficulty;
    if(recipe.ingredients){
      for(var i in recipe.ingredients){
        var ingredient = recipe.ingredients[i];
        var foodObj = _.find(foods, {id: ingredient.food.id});
        angular.copy(foodObj, ingredient.food);
        ingredient.price = PriceCalculator.ingredientPrice(ingredient, foodObj, _errors, _ctx);
        delete ingredient.food.created;
        delete ingredient.food.updated;
        delete ingredient.food.prices;
      }
    }
    recipe.price = PriceCalculator.recipePrice(recipe, _errors);
    return recipe;
  }

  return _FirebaseCrudBuilder.createDataService('recipes', process);
})

.factory('SelectionSrv', function($q, _FirebaseCrudBuilder, RecipeSrv, QuantityCalculator){
  'use strict';
  var srv1 = _FirebaseCrudBuilder.createDataService('weekrecipes', process1);
  var srv2 = _FirebaseCrudBuilder.createDataService('selections', process2);
  var service = {
    cache: {},
    cacheArr: [],
    get: function(id, backgroundUpdate, _lazy, _errors){
      return srv2.get(id, backgroundUpdate, _errors).then(function(selection){
        if(_lazy){ return selection; }
        else { return fullLoad(selection); }
      });
    },
    getAll: function(backgroundUpdate, _lazy, _errors){
      return srv2.getAll(backgroundUpdate, _errors).then(function(selections){
        if(_lazy){ service.cacheArr = selections; }
        else { service.cacheArr = fullLoadAll(selections, _errors); }
        return service.cacheArr;
      });
    },
    save: function(data, _errors){
      srv1.save(process1(data, _errors));
      return srv2.save(process2(data, _errors));
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

  function fullLoad(selection, _recipePromiseCache, _errors){
    if(selection && !selection.lazyLoaded && selection.recipes){
      selection.lazyLoaded = true;
      var recipePromises = [];
      for(var i in selection.recipes){
        recipePromises.push($q.when(selection.recipes[i].id).then(function(recipeId){
          if(_recipePromiseCache){
            if(!_recipePromiseCache[recipeId]){ _recipePromiseCache[recipeId] = RecipeSrv.get(recipeId); }
            return _recipePromiseCache[recipeId];
          } else {
            return RecipeSrv.get(recipeId, true, _errors);
          }
        }));
      }
      return $q.all(recipePromises).then(function(recipes){
        for(var i in selection.recipes){
          if(recipes[i]){
            selection.recipes[i] = recipes[i];
          }
        }
        return selection;
      });
    } else {
      if(selection){selection.lazyLoaded = true;}
      return $q.when(selection);
    }
  }

  function fullLoadAll(selections, _errors){
    var selectionPromises = [];
    var recipePromiseCache = [];
    for(var i in selections){
      selectionPromises.push($q.when(selections[i]).then(function(selection){
        return fullLoad(selection, recipePromiseCache, _errors);
      }));
    }
    return $q.all(selectionPromises);
  }

  function preProcess(formSelection, _errors){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    _FirebaseCrudBuilder.preprocessData(selection);
    delete selection.lazyLoaded;
    testMergeIngredients(selection, _errors);
    return selection;
  }
  function process1(formSelection, _errors){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    _FirebaseCrudBuilder.preprocessData(selection);
    delete selection.lazyLoaded;
    return selection;
  }
  function process2(formSelection, _errors){
    var selection = angular.copy(formSelection);
    if(!selection.id){selection.id = selection.week.toString();}
    _FirebaseCrudBuilder.preprocessData(selection);
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

  function testMergeIngredients(selection, _errors){
    var _ctx = {
      selection: selection
    };
    var ingredients = {};
    for(var i in selection.recipes){
      for(var j in selection.recipes[i].ingredients){
        var ingredient = selection.recipes[i].ingredients[j];
        if(!ingredients[ingredient.food.id]){ingredients[ingredient.food.id] = [];}
        ingredients[ingredient.food.id].push(ingredient);
      }
    }
    for(var k in ingredients){
      if(ingredients[k].length > 1){
        QuantityCalculator.addIngredients(ingredients[k], _errors, _ctx);
      }
    }
  }

  return service;
})

.factory('GlobalmessageSrv', function(_FirebaseCrudBuilder){
  'use strict';
  function process(formMessage){
    var message = angular.copy(formMessage);
    _FirebaseCrudBuilder.preprocessData(message);
    return message;
  }
  return _FirebaseCrudBuilder.createDataService('globalmessages', process);
})

.factory('_FirebaseCrudBuilder', function($q, $http, firebaseUrl, Utils, CollectionUtils){
  'use strict';
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
      cache: {},
      cacheArr: [],
      promiseCache: {},
      get: get,
      getAll: getAll,
      getWithIds: getWithIds,
      save: save,
      remove: remove,
      process: processDataFn,
      getUrl: getUrl
    };
    var collectionUrl = firebaseUrl+'/'+dataName;
    var collectionRef = new Firebase(collectionUrl);

    // get(id, backgroundUpdate, _errors)
    function get(id, backgroundUpdate, _errors){
      function update(){
        service.promiseCache[id] = $http.get(getUrl(id)).then(function(result){
          if(result.data !== 'null'){
            if(service.cache[id]){
              angular.copy(result.data, service.cache[id]);
            } else {
              service.cache[id] = angular.copy(result.data);
              service.cacheArr.push(service.cache[id]);
            }
          } else {
            var err = {
              message: 'Can\'t find '+dataName+' <'+id+'>',
              type: dataName,
              id: id
            };
            if(_errors){_errors.push(err);}
            console.warn(err.message, err);
          }
          delete service.promiseCache[id];
          return service.cache[id] ? service.cache[id] : null;
        });
        return service.promiseCache[id];
      }

      if(service.cache[id]){
        if(backgroundUpdate === undefined || backgroundUpdate){update();}
        return $q.when(service.cache[id]);
      } else if(service.promiseCache[id]){
        return service.promiseCache[id];
      } else {
        return update();
      }
    }

    // getAll(backgroundUpdate, _errors)
    function getAll(backgroundUpdate, _errors){
      function update(){
        return $http.get(getUrl()).then(function(result){
          if(result && result.data && typeof result.data === 'object'){
            angular.copy(result.data, service.cache);
            CollectionUtils.clear(service.cacheArr);
            CollectionUtils.toArray(service.cache, service.cacheArr);
          } else {
            var err = {
              message: 'Can\'t find all '+dataName,
              type: dataName
            };
            if(_errors){_errors.push(err);}
            console.warn(err.message, err);
          }
          return service.cacheArr;
        });
      }

      if(CollectionUtils.isEmpty(service.cache)){
        return update();
      } else {
        if(backgroundUpdate === undefined || backgroundUpdate){update();}
        return $q.when(service.cacheArr);
      }
    }

    function getWithIds(ids, backgroundUpdate, _errors){
      var promises = [];
      for(var i in ids){
        promises.push(get(ids[i], backgroundUpdate, _errors));
      }
      return $q.all(promises).then(function(results){
        return CollectionUtils.toMap(results);
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
            if(service.cache[elt.id]){
              angular.copy(elt, service.cache[elt.id]);
            } else {
              service.cache[elt.id] = angular.copy(elt);
              service.cacheArr.push(elt);
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
            delete service.cache[elt.id];
            _.remove(service.cacheArr, {id: elt.id});
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

  return service;
});