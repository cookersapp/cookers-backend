'use strict';

angular.module('app')

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
      if(userData.email === 'loicknuchel@gmail.com' || userData.email === 'audrey.stropp@gmail.com'){
        var user = { email: userData.email, username: userData.email, role: userRoles.user };
        angular.extend(currentUser, user);
        StorageSrv.set(storageKey, currentUser);
        loginDefer.resolve(user);
      } else {
        loginDefer.reject({
          message: 'Vous n\'avez pas les droits pour vous connecter !'
        });
      }
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
