'use strict';

angular.module('app', ['ui.router', 'ngCookies', 'ngStorage', 'ui.bootstrap'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, debug){
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


  var access = routingConfig.accessLevels;

  // Public routes
  $stateProvider
  .state('public', {
    abstract: true,
    template: '<ui-view/>',
    data: {
      access: access.public
    }
  });

  // Anonymous routes
  $stateProvider
  .state('anon', {
    abstract: true,
    template: '<ui-view/>',
    data: {
      access: access.anon
    }
  })
  .state('anon.login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  });

  // Regular user routes
  $stateProvider
  .state('user', {
    abstract: true,
    templateUrl: 'views/layout.html',
    controller: 'MainCtrl',
    data: {
      access: access.user
    }
  })
  .state('user.home', {
    url: '/',
    templateUrl: 'views/home.html'
  })
  .state('user.dashboard', {
    url: '/dashboard',
    templateUrl: 'views/dashboard.html',
    controller: 'DashboardCtrl'
  })
  .state('user.tables', {
    url: '/tables',
    templateUrl: 'views/tables.html'
  });

  $urlRouterProvider.otherwise('/');

  $httpProvider.interceptors.push(function($q, $location){
    return {
      'responseError': function(response){
        if(response.status === 401 || response.status === 403){
          $location.path('/login');
        }
        return $q.reject(response);
      }
    };
  });
})

.constant('debug', true)

.run(function($rootScope, $sce, $state, $localStorage, $window, AuthSrv){
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

  // Controls if user is authentified
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if(!(toState && toState.data && toState.data.access)){
      Logger.track('error', 'Access undefined for state <'+toState.name+'>');
      event.preventDefault();
    } else if(!AuthSrv.isAuthorized(toState.data.access)){
      Logger.track('error', 'Seems like you\'re not allowed to access to <'+toState.name+'> state...');
      event.preventDefault();

      if(fromState.url === '^'){
        if(AuthSrv.isLoggedIn()){
          $state.go('user.home');
        } else {
          $rootScope.error = null;
          $state.go('anon.login');
        }
      }
    }
  });

  // utils
  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest'){
      if(fn && (typeof(fn) === 'function')){
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
