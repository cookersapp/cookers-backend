'use strict';

angular.module('app')

.directive('source', function(Utils){
  return {
    restrict: 'A',
    templateUrl: 'views/directives/source.html',
    scope: {
      data: '=source'
    },
    link: function(scope, element, attr){
      scope.isLink = function(data){
        return typeof data === 'string' && Utils.isUrl(data);
      };
    }
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
