angular.module('app')


.factory('UsersSrv', function($http){
  'use strict';
  var service = {
    get: get,
    getAll: getAll
  };

  function get(id){
    return $http.get('/api/v1/users/'+id).then(function(result){
      return result.data;
    });
  }

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
    get: get,
    getAll: getAll,
    getForUser: getForUser,
    getAllExceptions: getAllExceptions,
    getAllErrors: getAllErrors,
    getAllMalformed: getAllMalformed
  };

  function get(id){
    return $http.get('/api/v1/track/events/'+id).then(function(result){
      return result.data;
    });
  }

  function getAll(){
    return $http.get('/api/v1/track/events').then(function(result){
      return result.data;
    });
  }

  function getForUser(id){
    return $http.get('/api/v1/users/'+id+'/events').then(function(result){
      return result.data;
    });
  }

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
    getWeekData: getWeekData,
    getUserActivity: getUserActivity,
    getRecipesStats: getRecipesStats
  };

  function getWeekData(){
    return $http.get('/api/v1/stats/week').then(function(result){
      return result.data;
    });
  }

  function getUserActivity(interval){
    return $http.get('/api/v1/stats/users/activity?interval='+(interval ? interval : 'week')).then(function(res){
      return res.data.activity;
    });
  }

  function getRecipesStats(type, week){
    return $http.get('/api/v1/stats/recipes/week/'+(week ? week : moment().week())+'?graph='+type).then(function(res){
      return res.data.stats;
    });
  }

  return service;
})


.factory('GraphSrv', function($http){
  'use strict';
  var service = {
    formatUserActivitySeries: formatUserActivitySeries,
    formatRecipeStatsSeries: formatRecipeStatsSeries,
    formatRecipeStatsDaysSeries: formatRecipeStatsDaysSeries
  };

  function formatUserActivitySeries(data){
    data.sort(function(a,b){
      return a.date - b.date;
    });
    var dayOffset = 1000 * 60 * 60 * 2; // to get points aligned with dates in graphs
    var registeredSerie = {name: 'Nouveaux', color: '#90ed7d', data: [] };
    var activeSerie = {name: 'Récurrents', color: '#7cb5ec', data: [] };
    var inactiveSerie = {name: 'Inactifs', color: '#8d4653', data: [] };
    for(var i in data){
      registeredSerie.data.push([data[i].date+dayOffset, data[i].registered]);
      activeSerie.data.push([data[i].date+dayOffset, data[i].recurring]);
      inactiveSerie.data.push([data[i].date+dayOffset, data[i].inactive]);
    }
    return [registeredSerie, activeSerie, inactiveSerie];
  }

  function formatRecipeStatsSeries(data){
    var arr = obj2arr(data);
    arr.sort(function(a, b){
      return sum(b) - sum(a);
    });
    var labels = [];
    var ingredientsSerie = {name: 'Ingrédients', data: []};
    var detailsSerie = {name: 'Carte de visite', data: []};
    var cartSerie = {name: 'Ajouté au panier', data: []};
    var cookSerie = {name: 'Cuisine', data: []};
    var cookedSerie = {name: 'Cuisinée', data: []};
    for(var i in arr){
      labels.push(arr[i].key);
      ingredientsSerie.data.push(arr[i]['recipe-ingredients-showed'] ? arr[i]['recipe-ingredients-showed'] : 0);
      detailsSerie.data.push(arr[i]['recipe-details-showed'] ? arr[i]['recipe-details-showed'] : 0);
      cartSerie.data.push(arr[i]['recipe-added-to-cart'] ? arr[i]['recipe-added-to-cart'] : 0);
      cookSerie.data.push(arr[i]['recipe-cook-showed'] ? arr[i]['recipe-cook-showed'] : 0);
      cookedSerie.data.push(arr[i]['recipe-cooked'] ? arr[i]['recipe-cooked'] : 0);
    }
    return {
      labels: labels,
      series: [ingredientsSerie, detailsSerie, cartSerie, cookSerie, cookedSerie]
    };
  }

  function formatRecipeStatsDaysSeries(data){
    var days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'San', 'Dim'];
    var arr = obj2arr(data);
    for(var i in arr){
      arr[i].key = parseInt(arr[i].key);
    }
    arr.sort(function(a, b){
      return a.key - b.key;
    });
    var labels = [];
    var ingredientsSerie = {name: 'Ingrédients', data: []};
    var detailsSerie = {name: 'Carte de visite', data: []};
    var cartSerie = {name: 'Ajouté au panier', data: []};
    var cookSerie = {name: 'Cuisine', data: []};
    var cookedSerie = {name: 'Cuisinée', data: []};
    for(var i in arr){
      labels.push(days[arr[i].key]);
      ingredientsSerie.data.push(arr[i]['recipe-ingredients-showed'] ? arr[i]['recipe-ingredients-showed'] : 0);
      detailsSerie.data.push(arr[i]['recipe-details-showed'] ? arr[i]['recipe-details-showed'] : 0);
      cartSerie.data.push(arr[i]['recipe-added-to-cart'] ? arr[i]['recipe-added-to-cart'] : 0);
      cookSerie.data.push(arr[i]['recipe-cook-showed'] ? arr[i]['recipe-cook-showed'] : 0);
      cookedSerie.data.push(arr[i]['recipe-cooked'] ? arr[i]['recipe-cooked'] : 0);
    }
    return {
      labels: labels,
      series: [ingredientsSerie, detailsSerie, cartSerie, cookSerie, cookedSerie]
    };
  }

  function obj2arr(obj){
    var arr = [];
    for(var i in obj){
      var elt = angular.copy(obj[i]);
      elt.key = i;
      arr.push(elt);
    }
    return arr;
  }
  function sum(elt){
    var total = 0;
    for(var i in elt){
      if(typeof elt[i] === 'number'){
        total += elt[i];
      }
    }
    return total;
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
