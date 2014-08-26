'use strict';

angular.module('app')

.factory('Utils', function($http, firebaseUrl){
  var service = {
    sort: sort,
    getData: getData,
    getDataArray: getDataArray,
    isUrl: isUrl
  };

  function getData(result){
    return result.data;
  }

  function getDataArray(result){
    var arr = [];
    for(var i in result.data){
      arr.push(result.data[i]);
    }
    return arr;
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

.factory('RecipeSrv', function($http, firebaseUrl, Utils){
  var service = {
    cache: [],
    getAll: getAll,
    get: get,
    getUrl: getUrl
  };

  function getAll(){
    return $http.get(getUrl()).then(Utils.getDataArray).then(function(recipes){
      service.cache = recipes;
      return recipes;
    });
  }

  function get(id){
    return $http.get(getUrl(id)).then(Utils.getData);
  }

  function getUrl(id){
    if(id)  { return firebaseUrl+'/recipes/'+id+'.json';  }
    else    { return firebaseUrl+'/recipes.json';         }
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
