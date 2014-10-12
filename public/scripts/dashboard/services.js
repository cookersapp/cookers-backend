angular.module('app')


.factory('UsersSrv', function($http){
  'use strict';
  var service = {
    getAll: getAll
  };

  function getAll(){
    return $http.get('/api/v1/users').then(function(result){
      return result.data;
    });
  }

  return service;
})


.factory('EventsSrv', function($http){
  'use strict';
  var service = {
    getAllExceptions: getAllExceptions,
    getAllErrors: getAllErrors,
    getAllMalformed: getAllMalformed
  };

  function getAllExceptions(){
    return $http.get('/api/v1/track/events?name=exception').then(function(result){
      return result.data;
    });
  }

  function getAllErrors(){
    return $http.get('/api/v1/track/events?name=error').then(function(result){
      return result.data;
    });
  }

  function getAllMalformed(){
    return $http.get('/api/v1/track/events/malformed').then(function(result){
      return result.data;
    });
  }

  return service;
})


.factory('StatsSrv', function($http){
  'use strict';
  var service = {
    getWeekData: getWeekData
  };

  function getWeekData(){
    return $http.get('/api/v1/stats/week').then(function(result){
      return result.data;
    });
  }

  return service;
})


.factory('CacheSrv', function($q, $http, firebaseUrl){
  'use strict';
  var cache = {};
  var service = {
    getUser   : function(id){ return get('users'    , '/api/v1/users/'+id                 , id);  },
    getRecipe : function(id){ return get('recipes'  , firebaseUrl+'/recipes/'+id+'.json'  , id);  },
    getFood   : function(id){ return get('foods'    , firebaseUrl+'/foods/'+id+'.json'    , id);  }
  };

  function get(type, url, id){
    if(!cache[type]){ cache[type] = {data: {}, promises: {}}; }

    if(cache[type].data[id]){
      return $q.when(cache[type].data[id]);
    } else if(cache[type].promises[id]){
      return cache[type].promises[id];
    } else {
      cache[type].promises[id] = $http.get(url).then(function(result){
        cache[type].data[id] = result.data;
        return result.data;
      });
      return cache[type].promises[id];
    }
  }

  return service;
});
