angular.module('app')


.factory('UsersSrv', function($q, $http, CollectionUtils){
  'use strict';
  var cache = {};
  var cacheArr = [];
  var promiseCache = {};
  var service = {
    get: get,
    getAll: getAll
  };

  function get(id, backgroundUpdate){
    function update(){
      promiseCache[id] = _get('/api/v1/users/'+id).then(function(user){
        if(cache[id]){
          angular.copy(user, cache[id]);
        } else {
          cache[id] = angular.copy(user);
          cacheArr.push(cache[id]);
        }
        delete promiseCache[id];
        return cache[id];
      });
      return promiseCache[id];
    }

    if(cache[id]){
      if(backgroundUpdate === undefined || backgroundUpdate){update();}
      return $q.when(cache[id]);
    } else if(promiseCache[id]){
      return promiseCache[id];
    } else {
      return update();
    }
  }

  function getAll(){
    var getAllPromise = _get('/api/v1/users').then(function(users){
      angular.copy(users, cacheArr);
      angular.copy(CollectionUtils.toMap(cacheArr), cache);
      return cacheArr;
    });

    if(CollectionUtils.isEmpty(cache)){
      return getAllPromise;
    } else {
      return $q.when(cacheArr);
    }
  }

  function _get(url){
    return $http.get(url).then(function(res){
      if(res && res.data && res.data.data){
        return res.data.data;
      }
    });
  }

  return service;
})


.factory('EventsSrv', function($http){
  'use strict';
  var service = {
    get               : function(id)  { return _get('/api/v1/track/events/'+id);            },
    getAll            : function()    { return _get('/api/v1/track/events');                },
    getForUser        : function(id)  { return _get('/api/v1/users/'+id+'/events');         },
    getAllExceptions  : function()    { return _get('/api/v1/track/events?name=exception'); },
    getAllErrors      : function()    { return _get('/api/v1/track/events?name=error');     },
    getAllMalformed   : function()    { return _get('/api/v1/track/events/malformed');      }
  };

  function _get(url){
    return $http.get(url).then(function(res){
      if(res && res.data && res.data.data){
        return res.data.data;
      }
    });
  }

  return service;
})


.factory('StatsSrv', function($http){
  'use strict';
  var service = {
    getWeekData     : function()            { return _get('/api/v1/stats/week');                                                          },
    getUserActivity : function(interval)    { return _get('/api/v1/stats/users/activity?interval='+(interval ? interval : 'week'));       },
    getRecipesStats : function(type, week)  { return _get('/api/v1/stats/recipes/week/'+(week ? week : moment().week())+'?graph='+type);  }
  };

  function _get(url){
    return $http.get(url).then(function(res){
      if(res && res.data && res.data.data){
        return res.data.data;
      }
    });
  }

  return service;
})


.factory('GraphSrv', function($q, $http, CollectionUtils, RecipeSrv){
  'use strict';
  var service = {
    formatUserActivitySeries: formatUserActivitySeries,
    formatUserActivityGrowthSeries: formatUserActivityGrowthSeries,
    formatRecipeStatsGraph: formatRecipeStatsGraph,
    formatRecipeStatsDaysGraph: formatRecipeStatsDaysGraph
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
    return $q.when({
      type: 'area',
      subtype: 'stacked',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: 'datetime',
      series: [registeredSerie, activeSerie, inactiveSerie]
    });
  }

  function formatUserActivityGrowthSeries(data){
    data.sort(function(a,b){
      return a.date - b.date;
    });
    var dayOffset = 1000 * 60 * 60 * 2; // to get points aligned with dates in graphs
    var growthSerie = {name: 'Croissance', color: '#90ed7d', data: [] };
    for(var i=1; i<data.length; i++){
      var growth = data[i].active - data[i-1].active;
      var growthPc = Math.round((growth / data[i-1].active) * 100 * 100) / 100;
      growthSerie.data.push([data[i].date+dayOffset, growthPc]);
    }
    return $q.when({
      type: 'area',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: 'datetime',
      series: [growthSerie]
    });
  }

  function formatRecipeStatsGraph(data){
    var arr = CollectionUtils.toArray(data);
    arr.sort(function(a, b){
      return sum(b) - sum(a);
    });
    var recipeIds = [];
    var ingredientsSerie = {name: 'Ingrédients', data: []};
    var detailsSerie = {name: 'Carte de visite', data: []};
    var cartSerie = {name: 'Ajouté au panier', data: []};
    var cookSerie = {name: 'Cuisine', data: []};
    var cookedSerie = {name: 'Cuisinée', data: []};
    for(var i in arr){
      recipeIds.push(arr[i].id);
      ingredientsSerie.data.push(arr[i]['recipe-ingredients-showed'] ? arr[i]['recipe-ingredients-showed'] : 0);
      detailsSerie.data.push(arr[i]['recipe-details-showed'] ? arr[i]['recipe-details-showed'] : 0);
      cartSerie.data.push(arr[i]['recipe-added-to-cart'] ? arr[i]['recipe-added-to-cart'] : 0);
      cookSerie.data.push(arr[i]['recipe-cook-showed'] ? arr[i]['recipe-cook-showed'] : 0);
      cookedSerie.data.push(arr[i]['recipe-cooked'] ? arr[i]['recipe-cooked'] : 0);
    }
    return RecipeSrv.getWithIds(recipeIds, false).then(function(recipes){
      var recipeNames = [];
      for(var i in recipeIds){
        recipeNames[i] = recipes[recipeIds[i]].name;
      }
      return {
        type: 'bar',
        legend: 'bottom',
        tooltip: { shared: true },
        xAxis: recipeNames,
        series: [ingredientsSerie, detailsSerie, cartSerie, cookSerie, cookedSerie]
      };
    });
  }

  function formatRecipeStatsDaysGraph(data){
    var days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'San', 'Dim'];
    var arr = CollectionUtils.toArray(data);
    for(var i in arr){
      arr[i].id = parseInt(arr[i].id);
    }
    arr.sort(function(a, b){
      return a.id - b.id;
    });
    var labels = [];
    var ingredientsSerie = {name: 'Ingrédients', data: []};
    var detailsSerie = {name: 'Carte de visite', data: []};
    var cartSerie = {name: 'Ajouté au panier', data: []};
    var cookSerie = {name: 'Cuisine', data: []};
    var cookedSerie = {name: 'Cuisinée', data: []};
    for(var i in arr){
      labels.push(days[arr[i].id]);
      ingredientsSerie.data.push(arr[i]['recipe-ingredients-showed'] ? arr[i]['recipe-ingredients-showed'] : 0);
      detailsSerie.data.push(arr[i]['recipe-details-showed'] ? arr[i]['recipe-details-showed'] : 0);
      cartSerie.data.push(arr[i]['recipe-added-to-cart'] ? arr[i]['recipe-added-to-cart'] : 0);
      cookSerie.data.push(arr[i]['recipe-cook-showed'] ? arr[i]['recipe-cook-showed'] : 0);
      cookedSerie.data.push(arr[i]['recipe-cooked'] ? arr[i]['recipe-cooked'] : 0);
    }
    return $q.when({
      type: 'line',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: labels,
      series: [ingredientsSerie, detailsSerie, cartSerie, cookSerie, cookedSerie]
    });
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
});
