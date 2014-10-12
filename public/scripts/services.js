angular.module('app')


.factory('AuthSrv', function($rootScope, $state, $q, StorageSrv, $firebaseSimpleLogin, firebaseUrl){
  'use strict';
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
      //if(userData.email === 'loicknuchel@gmail.com' || userData.email === 'audrey.stropp@gmail.com'){
      var user = { email: userData.email, username: userData.email, role: userRoles.user };
      angular.extend(currentUser, user);
      StorageSrv.set(storageKey, currentUser);
      loginDefer.resolve(user);
      /*} else {
        loginDefer.reject({
          message: 'Vous n\'avez pas les droits pour vous connecter !'
        });
      }*/
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
})


.factory('MixpanelSrv', function($q, $http){
  'use strict';
  // requiert : https://github.com/michaelcarter/mixpanel-data-export-js
  // mixpnael doc : https://mixpanel.com/docs/api-documentation/data-export-api
  // params starting with _ are optionnals
  // functions starting with _ are privates
  var service = {
    create: create,
    exportData: exportData
  };

  function create(credentials, _unit){
    var mixpanel = new MixpanelExport({
      api_key: credentials.api_key,
      api_secret: credentials.api_secret
    });
    var defaultParams = {};
    if(_unit){defaultParams.unit = _unit;}

    return {
      events: function(events, _params){ return _events(mixpanel, events, angular.extend({}, defaultParams, _params)); }
    };
  }

  // Get unique, total, or average data counts for a set of events over the last N days, weeks, or months.
  function _events(mixpanel, events, params){
    var defer = $q.defer();
    if(mixpanel !== null){
      params.event = events;
      mixpanel.events(params, function(data) {
        defer.resolve(data);
      });
    } else {
      defer.reject({message: 'Credentials are not set !'});
    }
    return defer.promise;
  }

  function exportData(credentials){
    var mixpanel = new MixpanelExport({
      api_key: credentials.api_key,
      api_secret: credentials.api_secret,
      api_stub: 'http://data.mixpanel.com/api/2.0/',
      timeout_after: 60
    });

    // ends with a 400 Bad request error :(
    mixpanel.get(['export'], {from_date: '2014-08-29', to_date: '2014-08-30', event: ['exception']}, function(data){
      console.log('data', data);
    });
    return $q.when();

    // ends with "Unexpected token :" when angular tries to parse result (but request is OK)
    /*var url = mixpanel._buildRequestURL(['export'], {from_date: '2014-08-28', to_date: '2014-08-30', event: ['exception']});
    console.log('url', url);
    return $http.jsonp(url, {
      transformResponse: function(data, headers){
        console.log('raw data', data);
        return buildResult(data);
      }
    }).then(function(result){
      console.log('result', result);
      return result.data;
    }, function(err){
      console.log('err', err);
    });

    function buildResult(strValue){
      if(strValue){
        // add ',' at the end of all lines
        var step1 = strValue.replace(new RegExp('\n', 'g'), ',');
        // put data in an array
        var step2 = '['+step1+']';
        // remove last ',' to get a correct array
        var step3 = step2.replace(',]', ']');
        // parse json and return JS object
        return JSON.parse(step3);
      }
    }*/
  }

  return service;
});
