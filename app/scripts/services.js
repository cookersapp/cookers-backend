'use strict';

angular.module('app')

.factory('Utils', function($http){
  var service = {
    createUuid: createUuid,
    isUrl: isUrl,
    extendsWith: extendsWith,
    sort: sort
  };

  function createUuid(){
    function S4(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

  function isUrl(text) {
    return (/^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i).test(text);
  }

  function extendsWith(dest, src){
    for(var i in src){
      if(typeof src[i] === 'object'){
        if(dest[i] === undefined || dest[i] === null){
          dest[i] = angular.copy(src[i]);
        } else if(typeof dest[i] === 'object'){
          extendsWith(dest[i], src[i]);
        }
      } else if(typeof src[i] === 'function'){
        // nothing
      } else if(dest[i] === undefined || dest[i] === null){
        dest[i] = src[i];
      }
    }
  }

  function sort(arr, params){
    if(arr && Array.isArray(arr)){
      if(params.order === 'updated'){arr.sort(_updatedSort);}
      else if(params.order === 'week'){arr.sort(_weekSort);}
      else if(params.order === 'name'){arr.sort(_nameSort);}
      else if(params.order === 'category'){arr.sort(_categorySort);}

      if(params.desc){arr.reverse();}
    }
  }

  function _updatedSort(a, b){
    var aDate = a.updated ? a.updated : a.created;
    var bDate = b.updated ? b.updated : b.created;
    return aDate - bDate;
  }
  function _weekSort(a, b){
    return a.week - b.week;
  }
  function _nameSort(a, b){
    var aName = a && a.name ? a.name.toLowerCase() : '';
    var bName = b && b.name ? b.name.toLowerCase() : '';
    if(aName > bName){ return 1; }
    else if(aName < bName){ return -1; }
    else { return 0; }
  }
  function _categorySort(a, b){
    var aCategory = a && a.category ? a.category.toLowerCase() : '';
    var bCategory = b && b.category ? b.category.toLowerCase() : '';
    if(aCategory > bCategory){ return 1; }
    else if(aCategory < bCategory){ return -1; }
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
