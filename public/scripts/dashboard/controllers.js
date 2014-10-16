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


.controller('DashboardUsersCtrl', function($rootScope, $scope, $q, $http, UsersSrv){
  'use strict';
  $rootScope.config.header.title = 'Users dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Users'}
  ];

  UsersSrv.getAll().then(function(users){
    $scope.users = users || [];
  });

  var dailyUsersDefer = $q.defer();
  $scope.dailyUsers = dailyUsersDefer.promise;
  $http.get('/api/v1/stats/users/activity').then(function(res){
    var data = res.data.activity;
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

    dailyUsersDefer.resolve({
      type: 'area',
      subtype: 'stacked',
      xAxis: 'datetime',
      tooltip: {
        shared: true
      },
      legend: 'bottom',
      series: [registeredSerie, activeSerie, inactiveSerie]
    });
  });
})


.controller('DashboardUserCtrl', function($rootScope, $scope, $stateParams, UsersSrv, EventsSrv){
  'use strict';
  var userId = $stateParams.userId;

  $rootScope.config.header.title = 'User profile';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Users', state: 'user.dashboard.users'},
    {name: 'User profile'}
  ];

  UsersSrv.get(userId).then(function(user){
    $scope.user = user;
  });
  EventsSrv.getForUser(userId).then(function(events){
    $scope.events = events;
  });
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
    legend: 'bottom',
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
    legend: 'bottom',
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


.controller('DashboardEventsCtrl', function($rootScope, $scope, EventsSrv){
  'use strict';
  $rootScope.config.header.title = 'Events dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Events'}
  ];

  EventsSrv.getAll().then(function(events){
    $scope.events = events || [];
  });
})


.controller('DashboardExceptionsCtrl', function($rootScope, $scope, EventsSrv){
  'use strict';
  $rootScope.config.header.title = 'Exceptions dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Exceptions'}
  ];

  EventsSrv.getAllExceptions().then(function(events){
    $scope.events = events || [];
  });
})


.controller('DashboardErrorsCtrl', function($rootScope, $scope, EventsSrv){
  'use strict';
  $rootScope.config.header.title = 'Errors dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Errors'}
  ];

  EventsSrv.getAllErrors().then(function(events){
    $scope.events = events || [];
  });
})


.controller('DashboardMalformedCtrl', function($rootScope, $scope, EventsSrv){
  'use strict';
  $rootScope.config.header.title = 'Malformed dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Malformed'}
  ];

  EventsSrv.getAllMalformed().then(function(events){
    $scope.events = events || [];
  });

  $scope.toggleEvent = function(elt){
    if($scope.eventSelected === elt){$scope.eventSelected = null;}
    else {$scope.eventSelected = elt;}
  };
})


.controller('DashboardEventCtrl', function($rootScope, $scope, $stateParams, EventsSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  $rootScope.config.header.title = 'Event profile';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Events', state: 'user.dashboard.events'},
    {name: 'Event details'}
  ];

  EventsSrv.get(eventId).then(function(event){
    $scope.event = event || {};
  });
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
});
