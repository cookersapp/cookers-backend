'use strict';

angular.module('app')

.factory('Utils', function($http, firebaseUrl){
  var service = {
    createUuid: createUuid,
    isUrl: isUrl,
    sort: sort,
    getData: getData,
    getDataArray: getDataArray
  };

  function getData(result){
    return result.data !== 'null' ? result.data : null;
  }

  function getDataArray(result){
    var arr = [];
    if(result && result.data && typeof result.data === 'object'){
      for(var i in result.data){
        arr.push(result.data[i]);
      }
    }
    return arr;
  }

  function createUuid(){
    function S4(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

  function isUrl(text) {
    return (/^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i).test(text);
  }

  function sort(arr, params){
    if(arr && Array.isArray(arr)){
      if(params.order === 'updated'){arr.sort(_updatedSort);}
      else if(params.order === 'name'){arr.sort(_nameSort);}

      if(params.desc){arr.reverse();}
    }
  }

  function _updatedSort(a, b){
    var da = a.updated ? a.updated : a.created;
    var db = b.updated ? b.updated : b.created;
    return da - db;
  }
  function _nameSort(a, b){
    if(a.name.toLowerCase() > b.name.toLowerCase()){ return 1; }
    else if(a.name.toLowerCase() < b.name.toLowerCase()){ return -1; }
    else { return 0; }
  }

  return service;
})

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
})

.factory('RecipeSrv', function($q, $http, firebaseUrl, Calculator, Utils){
  var service = {
    cache: [],
    getAll: getAll,
    get: get,
    save: save,
    remove: remove,
    process: process,
    getUrl: getUrl
  };
  var name = 'recipes';
  var collectionUrl = firebaseUrl+'/'+name;
  var collectionRef = new Firebase(collectionUrl);

  function getAll(){
    return $http.get(getUrl()).then(Utils.getDataArray).then(function(recipes){
      service.cache = recipes;
      return recipes;
    });
  }

  function get(id){
    return $http.get(getUrl(id)).then(Utils.getData);
  }

  function save(recipe){
    var defer = $q.defer();
    if(recipe && recipe.id){
      collectionRef.child(recipe.id).set(recipe, function(error){
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
        recipe: recipe
      });
    }
    return defer.promise;
  }

  function remove(recipe){
    var defer = $q.defer();
    if(recipe && recipe.id){
      collectionRef.child(recipe.id).remove(function(error){
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
        recipe: recipe
      });
    }
    return defer.promise;
  }

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

  function getUrl(id){
    if(id)  { return collectionUrl+'/'+id+'.json';  }
    else    { return collectionUrl+'.json';         }
  }

  return service;
})

.factory('FoodSrv', function($http, firebaseUrl, Utils){
  var service = {
    cache: [],
    getAll: getAll,
    get: get,
    getUrl: getUrl
  };

  function getAll(){
    return $http.get(getUrl()).then(Utils.getDataArray).then(function(foods){
      service.cache = foods;
      return foods;
    });
  }

  function get(id){
    return $http.get(getUrl(id)).then(Utils.getData);
  }

  function getUrl(id){
    if(id)  { return firebaseUrl+'/foods/'+id+'.json';  }
    else    { return firebaseUrl+'/foods.json';         }
  }

  return service;
})

.factory('SelectionsSrv', function($q, $http, firebaseUrl, Utils){
  var service = {
    cache: [],
    getAll: getAll,
    get: get,
    save: save,
    process: process,
    getUrl: getUrl
  };
  var name = 'weekrecipes';
  var collectionUrl = firebaseUrl+'/'+name;
  var collectionRef = new Firebase(collectionUrl);

  function getAll(){
    return $http.get(getUrl()).then(Utils.getDataArray).then(function(selections){
      service.cache = selections;
      return selections;
    });
  }

  function get(id){
    return $http.get(getUrl(id)).then(Utils.getData);
  }

  function save(selection){
    var defer = $q.defer();
    if(selection && selection.id){
      collectionRef.child(selection.id).set(selection, function(error){
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
        selection: selection
      });
    }
    return defer.promise;
  }

  function process(formSelection){
    var selection = angular.copy(formSelection);
    if(!selection.created){selection.created = Date.now();}
    selection.updated = Date.now();
    selection.id = selection.week.toString();
    return selection;
  }

  function getUrl(id){
    if(id)  { return collectionUrl+'/'+id+'.json';  }
    else    { return collectionUrl+'.json';         }
  }

  return service;
})

.factory('StorageSrv', function(){
  var service = {
    get:    function(key){        if(localStorage){ return JSON.parse(localStorage.getItem(key));     } },
    set:    function(key, value){ if(localStorage){ localStorage.setItem(key, JSON.stringify(value)); } },
    remove: function(key){        if(localStorage){ localStorage.removeItem(key);                     } }
  };

  return service;
})


.factory('AuthSrv', function($rootScope, $state, $q, StorageSrv, $firebaseSimpleLogin, firebaseUrl){
  var storageKey = 'user',
      accessLevels = routingConfig.accessLevels,
      userRoles = routingConfig.userRoles,
      defaultUser = { username: '', role: userRoles.public },
      currentUser = StorageSrv.get(storageKey) || angular.copy(defaultUser),
      loginDefer = null,
      logoutDefer = null;

  var service = {
    isAuthorized: isAuthorized,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    accessLevels: accessLevels,
    userRoles: userRoles,
    user: currentUser
  };


  var firebaseRef = new Firebase(firebaseUrl);
  var firebaseAuth = $firebaseSimpleLogin(firebaseRef);

  function isAuthorized(accessLevel, role){
    if(role === undefined){ role = currentUser.role; }
    return accessLevel.bitMask & role.bitMask;
  }

  function isLoggedIn(user){
    if(user === undefined){ user = currentUser; }
    return user.role && user.role.title !== userRoles.public.title;
  }

  function login(credentials){
    loginDefer = $q.defer();
    firebaseAuth.$login('password', credentials);
    return loginDefer.promise;
  }

  function logout(){
    var logoutDefer = $q.defer();
    firebaseAuth.$logout();
    return logoutDefer.promise;
  }

  $rootScope.$on('$firebaseSimpleLogin:login', function(event, userData){
    if(loginDefer){
      var user = { email: userData.email, username: userData.email, role: userRoles.user };
      angular.extend(currentUser, user);
      StorageSrv.set(storageKey, currentUser);
      loginDefer.resolve(user);
    }
  });
  $rootScope.$on('$firebaseSimpleLogin:logout', function(event){
    if(logoutDefer || isLoggedIn()){
      angular.copy(defaultUser, currentUser);
      StorageSrv.set(storageKey, currentUser);
      if(logoutDefer){logoutDefer.resolve();}
      else {$state.go('anon.login');}
    }
  });
  $rootScope.$on('$firebaseSimpleLogin:error', function(event, error){
    error.message = error.message.replace('FirebaseSimpleLogin: ', '');
    if(loginDefer){loginDefer.reject(error);}
    if(logoutDefer){logoutDefer.reject(error);}
  });

  return service;
});
