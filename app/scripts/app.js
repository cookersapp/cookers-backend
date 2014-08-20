'use strict';

// Dashboard from https://github.com/Ehesp/Responsive-Dashboard
angular.module('app', ['ui.bootstrap', 'ui.router', 'ngCookies'])

.config(function($stateProvider, $urlRouterProvider){
  // For unmatched routes
  $urlRouterProvider.otherwise('/');

  // Application routes
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'views/dashboard.html'
  })
  .state('tables', {
    url: '/tables',
    templateUrl: 'views/tables.html'
  });
})

.controller('MasterCtrl', function($scope, $cookieStore){
  var mobileView = 992;

  $scope.getWidth = function(){ return window.innerWidth; };

  $scope.toggleSidebar = function(){
    $scope.toggle = !$scope.toggle;
    $cookieStore.put('toggle', $scope.toggle);
  };

  $scope.$watch($scope.getWidth, function(newValue){
    if(newValue >= mobileView){
      if(angular.isDefined($cookieStore.get('toggle'))){
        if($cookieStore.get('toggle') === false){
          $scope.toggle = false;
        } else {
          $scope.toggle = true;
        }
      } else {
        $scope.toggle = true;
      }
    } else {
      $scope.toggle = false;
    }
  });

  window.onresize = function(){ $scope.$apply(); };
})

.controller('AlertsCtrl', function($scope){
  $scope.alerts = [
    {type: 'success', msg: 'Thanks for visiting! Feel free to create pull requests to improve the dashboard!'},
    {type: 'danger', msg: 'Found a bug? Create an issue with as many details as you can.'}
  ];

  $scope.addAlert = function(){
    $scope.alerts.push({msg: 'Another alert!'});
  };

  $scope.closeAlert = function(index){
    $scope.alerts.splice(index, 1);
  };
})

.directive('rdWidget', function(){
  var directive = {
    transclude: true,
    template: '<div class="widget" ng-transclude></div>',
    restrict: 'EA'
  };
  return directive;
})

.directive('rdWidgetHeader', function(){
  var directive = {
    requires: '^rdWidget',
    scope: {
      title: '@',
      icon: '@'
    },
    transclude: true,
    template: '<div class="widget-header"> <i class="fa" ng-class="icon"></i> {{title}} <div class="pull-right" ng-transclude></div></div>',
    restrict: 'E'
  };
  return directive;
})

.directive('rdWidgetBody', function(){
  var directive = {
    requires: '^rdWidget',
    scope: {
      loading: '@?'
    },
    transclude: true,
    template: '<div class="widget-body"><rd-loading ng-show="loading"></rd-loading><div ng-hide="loading" class="widget-content" ng-transclude></div></div>',
    restrict: 'E'
  };
  return directive;
})

/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */
.directive('rdLoading', function (){
  var directive = {
    restrict: 'AE',
    template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
  };
  return directive;
});
