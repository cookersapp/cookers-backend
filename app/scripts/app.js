'use strict';

angular.module('app', ['ui.router', 'ngStorage', 'ui.bootstrap'])

.config(function($stateProvider, $urlRouterProvider, $provide){
  // For unmatched routes
  $urlRouterProvider.otherwise('/');

  // Application routes
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'views/dashboard.html',
    controller: 'AlertsCtrl'
  })
  .state('tables', {
    url: '/tables',
    templateUrl: 'views/tables.html'
  });

  // catch exceptions
  $provide.decorator('$exceptionHandler', ['$delegate', function($delegate){
    return function(exception, cause){
      $delegate(exception, cause);

      var data = {
        type: 'angular',
        url: window.location.hash,
        localtime: Date.now()
      };
      if(cause)               { data.cause    = cause;              }
      if(exception){
        if(exception.message) { data.message  = exception.message;  }
        if(exception.name)    { data.name     = exception.name;     }
        if(exception.stack)   { data.stack    = exception.stack;    }
      }

      console.log('exception', data);
      window.alert('Error: '+data.message);
    };
  }]);
  window.onerror = function(message, url, line, col, error){
    var stopPropagation = false;
    var data = {
      type: 'javascript',
      url: window.location.hash,
      localtime: Date.now()
    };
    if(message)       { data.message      = message;      }
    if(url)           { data.fileName     = url;          }
    if(line)          { data.lineNumber   = line;         }
    if(col)           { data.columnNumber = col;          }
    if(error){
      if(error.name)  { data.name         = error.name;   }
      if(error.stack) { data.stack        = error.stack;  }
    }

    console.log('exception', data);
    window.alert('Error: '+data.message);
    return stopPropagation;
  };
})

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
