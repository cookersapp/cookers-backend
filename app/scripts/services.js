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


.factory('AuthSrv', function($q, $http, StorageSrv){
  var storageKey = 'user',
      accessLevels = routingConfig.accessLevels,
      userRoles = routingConfig.userRoles,
      defaultUser = { username: '', role: userRoles.public },
      currentUser = StorageSrv.get(storageKey) || defaultUser;

  function changeUser(user){
    angular.extend(currentUser, user);
    StorageSrv.set(storageKey, currentUser);
  }

  return {
    isAuthorized: function(accessLevel, role){
      if(role === undefined){ role = currentUser.role; }
      return accessLevel.bitMask & role.bitMask;
    },
    isLoggedIn: function(user){
      if(user === undefined){ user = currentUser; }
      return user.role && user.role.title !== userRoles.public.title;
    },
    /*register: function(user, success, error){
      $http.post('/register', user).success(function(res){
        changeUser(res);
        success();
      }).error(error);
    },*/
    login: function(credentials){
      var loginDefer = $q.defer();
      if(credentials.email === 'loicknuchel@gmail.com'){
        var user = { email: credentials.email, username: credentials.email, role: userRoles.user };
        console.log('user', user);
        changeUser(user);
        loginDefer.resolve(user);
      } else {
        loginDefer.reject({
          message: 'Bad user !'
        });
      }
      return loginDefer.promise;
    },
    logout: function(){
      var logoutDefer = $q.defer();
      changeUser(defaultUser);
      logoutDefer.resolve();
      return logoutDefer.promise;
    },
    accessLevels: accessLevels,
    userRoles: userRoles,
    user: currentUser
  };
});
