'use strict';

angular.module('app', ['ui.router', 'ngStorage', 'ui.bootstrap'])

.config(function($stateProvider, $urlRouterProvider, $provide, debug){
  Logger.setDebug(debug);

  // catch exceptions in angular
  $provide.decorator('$exceptionHandler', ['$delegate', function($delegate){
    return function(exception, cause){
      $delegate(exception, cause);

      var data = {
        type: 'angular'
      };
      if(cause)               { data.cause    = cause;              }
      if(exception){
        if(exception.message) { data.message  = exception.message;  }
        if(exception.name)    { data.name     = exception.name;     }
        if(exception.stack)   { data.stack    = exception.stack;    }
      }

      Logger.track('exception', data);
    };
  }]);


  // For unmatched routes
  $urlRouterProvider.otherwise('/');

  // Application routes
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'views/home.html'
  })
  .state('dashboard', {
    url: '/dashboard',
    templateUrl: 'views/dashboard.html',
    controller: 'AlertsCtrl'
  })
  .state('tables', {
    url: '/tables',
    templateUrl: 'views/tables.html'
  });
})

.constant('debug', true)

.run(function($rootScope, $sce, $localStorage, $window){
  // init
  if(!$localStorage.state){$localStorage.state = {};}
  $rootScope.state = $localStorage.state;

  $rootScope.toggleSidebar = function(){
    $rootScope.state.toggle = !$rootScope.state.toggle;
  };

  var mobileView = 992;
  $rootScope.$watch(function(){ return $window.innerWidth; }, function(newValue){
    if(newValue >= mobileView){
      if ($rootScope.state.toggle === undefined){
        $rootScope.state.toggle = true;
      }
    } else {
      $rootScope.state.toggle = false;
    }
  });

  $window.onresize = function(){ $rootScope.$apply(); };

  // utils
  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest'){
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.trustHtml = function(html){
    return $sce.trustAsHtml(html);
  };
});
