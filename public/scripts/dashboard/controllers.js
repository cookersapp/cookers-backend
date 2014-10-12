angular.module('app')


.controller('DashboardCtrl', function($rootScope, $scope, StatsSrv, UsersSrv, EventsSrv){
  'use strict';
  $rootScope.config.header.title = 'Dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard'}
  ];

  EventsSrv.getAllExceptions().then(function(events){
    $scope.exceptionEvents = events || [];
  });

  EventsSrv.getAllErrors().then(function(events){
    $scope.errorEvents = events || [];
  });

  EventsSrv.getAllMalformed().then(function(events){
    $scope.malformedEvents = events || [];
  });

  StatsSrv.getWeekData().then(function(stats){
    $scope.stats = stats || {};
  });

  UsersSrv.getAll().then(function(users){
    $scope.users = users || [];
  });
})


.controller('DashboardUsersCtrl', function($rootScope, $scope, $q, UsersSrv){
  'use strict';
  $rootScope.config.header.title = 'Users dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Users'}
  ];

  var defer = $q.defer();
  $scope.dailyUsers = defer.promise;
  setTimeout(function(){
    defer.resolve({
      type: 'area',
      subtype: 'stacked',
      xAxis: 'datetime',
      tooltip: {
        shared: true
      },
      legend: 'bottom',
      series: [{
        name: 'Nouveaux',
        color: '#90ed7d',
        data: [[Date.UTC(2014,10,5), 163], [Date.UTC(2014,10,6), 203], [Date.UTC(2014,10,7), 276], [Date.UTC(2014,10,8), 408], [Date.UTC(2014,10,9), 547], [Date.UTC(2014,10,10), 729], [Date.UTC(2014,10,11), 628]]
      }, {
        name: 'Actifs',
        color: '#7cb5ec',
        data: [[Date.UTC(2014,10,5), 106], [Date.UTC(2014,10,6), 107], [Date.UTC(2014,10,7), 111], [Date.UTC(2014,10,8), 133], [Date.UTC(2014,10,9), 221], [Date.UTC(2014,10,10), 767], [Date.UTC(2014,10,11), 1766]]
      }, {
        name: 'Inactifs',
        color: '#8d4653',
        data: [[Date.UTC(2014,10,5), 502], [Date.UTC(2014,10,6), 635], [Date.UTC(2014,10,7), 809], [Date.UTC(2014,10,8), 947], [Date.UTC(2014,10,9), 1402], [Date.UTC(2014,10,10), 3634], [Date.UTC(2014,10,11), 5268]]
      }]
    });
  }, 600);

  $scope.weeklyUsers = {
    type: 'area',
    xAxis: function(){ return 1940+this.value; },
    tooltip: { pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}' },
    legend: false,
    series: [{
      name: 'USSR/Russia',
      data: [null, null, null, null, null, null, null, null, null, null,
             5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
             4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
             15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
             33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
             35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
             21000, 20000, 19000, 18000, 18000, 17000, 16000]
    }]
  };

  UsersSrv.getAll().then(function(users){
    $scope.users = users || [];
  });
})


.controller('DashboardUserCtrl', function($rootScope){
  'use strict';
  $rootScope.config.header.title = 'User profile';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Users', state: 'user.dashboard.users'},
    {name: 'User profile'}
  ];
})


.controller('DashboardRecipesCtrl', function($rootScope, $scope){
  'use strict';
  $rootScope.config.header.title = 'Recipes dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Recipes'}
  ];

  $scope.weekRecipes = {
    type: 'bar',
    xAxis: ['Recette 1', 'Recette 2', 'Recette 3', 'Recette 4', 'Recette 5', 'Recette 6', 'Recette 7', 'Recette 8', 'Recette 9', 'Recette 10'],
    series: [{
      name: 'Ingrédients',
      data: [107, 31, 635, 203, 2, 133, 156, 947, 408, 6]
    }, {
      name: 'Carte de visite',
      data: [133, 156, 947, 408, 6, 973, 914, 4054, 732, 34]
    }, {
      name: 'Ajouté au panier',
      data: [973, 914, 4054, 732, 34, 107, 31, 635, 203, 2]
    }, {
      name: 'Cuisine',
      data: [107, 31, 635, 203, 2, 133, 156, 947, 408, 6]
    }, {
      name: 'Cuisinée',
      data: [133, 156, 947, 408, 6, 973, 914, 4054, 732, 34]
    }]
  };

  $scope.recipesThroughWeek = {
    type: 'line',
    xAxis: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'San', 'Dim'],
    series: [{
      name: 'Ingrédients',
      data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2]
    }, {
      name: 'Carte de visite',
      data: [0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8]
    }, {
      name: 'Ajouté au panier',
      data: [0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6]
    }, {
      name: 'Cuisine',
      data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0]
    }, {
      name: 'Cuisinée',
      data: [24.1, 20.1, 14.1, 8.6, 2.5]
    }]
  };
})


.controller('TrackingCtrl', function($rootScope, $scope, $http, env){
  'use strict';
  var ctx = {
    model: {
      users: [],
      events: [],
      malformedEvents: []
    }
  };

  $rootScope.config.header.title = 'Tracking';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Tracking'}
  ];

  $scope.env = env;
  $scope.model = ctx.model;
  $scope.userSelected = null;
  $scope.eventSelected = null;

  $http.get('/api/v1/users').then(function(results){
    if(results && results.data){
      $scope.model.users = results.data;
    }
  });
  $http.get('/api/v1/track/events').then(function(results){
    if(results && results.data){
      $scope.model.events = results.data;
    }
  });
  $http.get('/api/v1/track/events/malformed').then(function(results){
    if(results && results.data){
      $scope.model.malformedEvents = results.data;
    }
  });

  $scope.toggleUser = function(elt){
    if($scope.userSelected === elt){$scope.userSelected = null;}
    else {$scope.userSelected = elt;}
  };
  $scope.toggleEvent = function(elt){
    if($scope.eventSelected === elt){$scope.eventSelected = null;}
    else {$scope.eventSelected = elt;}
  };

  $scope.resetApp = function(){
    if(confirm('Supprimer toutes les données de l\'application ?')){
      if(confirm('Vraiment ???')){
        $http.delete('/api/v1/reset-database').then(function(result){
          alert('Fait !');
        });
      }
    }
  };
});
