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


.controller('DashboardUsersCtrl', function($rootScope, $scope, $q, $http, UsersSrv, StatsSrv, GraphSrv){
  'use strict';
  $rootScope.config.header.title = 'Users dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Users'}
  ];

  UsersSrv.getAll().then(function(users){
    $scope.users = users || [];
  });

  $scope.dailyUsers = StatsSrv.getUserActivity('day').then(function(data){
    var series = GraphSrv.formatUserActivitySeries(data);
    return {
      type: 'area',
      subtype: 'stacked',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: 'datetime',
      series: series
    };
  });

  $scope.weeklyUsers = StatsSrv.getUserActivity('week').then(function(data){
    var series = GraphSrv.formatUserActivitySeries(data);
    return {
      type: 'area',
      subtype: 'stacked',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: 'datetime',
      series: series
    };
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


.controller('DashboardRecipesCtrl', function($rootScope, $scope, StatsSrv, GraphSrv){
  'use strict';
  $rootScope.config.header.title = 'Recipes dashboard';
  $rootScope.config.header.levels = [
    {name: 'Dashboard', state: 'user.home'},
    {name: 'Recipes'}
  ];

  $scope.weekRecipes = StatsSrv.getRecipesStats('recipes').then(function(data){
    var ret = GraphSrv.formatRecipeStatsSeries(data);
    return {
      type: 'bar',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: ret.labels,
      series: ret.series
    };
  });

  $scope.recipesThroughWeek = StatsSrv.getRecipesStats('days').then(function(data){
    var ret = GraphSrv.formatRecipeStatsDaysSeries(data);
    return {
      type: 'line',
      legend: 'bottom',
      tooltip: { shared: true },
      xAxis: ret.labels,
      series: ret.series
    };
  });
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
