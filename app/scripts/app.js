angular.module('firebaseAdminApp', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider){
  'use strict';
  $urlRouterProvider.otherwise('/home');

  $stateProvider
  .state('app', {
    url: '',
    abstract: true,
    templateUrl: 'views/root.html',
    controller: 'AppCtrl'
  })
  .state('app.home', {
    url: '/home',
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  });
})

.run(function($rootScope, $location){
  $rootScope.isActive = function (viewLocation) {
    var regex = new RegExp('^'+viewLocation+'$', 'g');
    return regex.test($location.path());
  };

  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});