'use strict';

angular.module('app')

/*
 * Load bootstrap affix plugin
 *  Plugin find elements on onload but angular markup is set after :(
 */
.directive('ngAffix', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      var $spy = $(element);
      var data = $spy.data();

      data.offset = data.offset || {};

      if(attr.offsetBottom) { data.offset.bottom = attr.offsetBottom; }
      if(attr.offsetTop)    { data.offset.top    = attr.offsetTop;    }

      $spy.affix(data);
    }
  }
})

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

.directive('mediaCrushUpload', function(){
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'views/directives/mediaCrushUpload.html',
    replace: true,
    scope: {
      ngModel: '=',
      format: '@'
    },
    link: function(scope, element, attr){
      console.log(scope.format);
      scope.file = '';
      scope.loading = false;
      scope.media = null;

      scope.$watch('file', function(newVal, oldVal){
        if(typeof newVal === 'object'){
          //safeApply(function(){
          scope.loading = true;
          scope.image = null;
          scope.ngModel = '';
          //});
          MediaCrush.upload(newVal, function(media){
            media.wait(function(){
              MediaCrush.get(media.hash, function(media){
                safeApply(function(){
                  scope.loading = false;
                  scope.media = media;
                  scope.ngModel = media.files[0].url;
                });
              });
            });
          });
        }
      });

      function safeApply(fn){
        if(!scope.$$phase) {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }
  };
})

.directive('file', function(){
  // from https://github.com/angular/angular.js/issues/1375#issuecomment-15690425
  'use strict';
  return {
    restrict: 'E',
    template: '<input type="file" />',
    replace: true,
    require: 'ngModel',
    link: function(scope, element, attr, ngModelCtrl){
      element.bind('change', function(){
        safeApply(function(){
          if(attr.multiple){
            ngModelCtrl.$setViewValue(element[0].files);
          } else {
            ngModelCtrl.$setViewValue(element[0].files[0]);
          }
        });
      });

      function safeApply(fn){
        if(!scope.$$phase) {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
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

.directive('loadingButton', function(Utils){
  return {
    restrict: 'E',
    template: ['<button type="{{btnType ? btnType : \'button\'}}" class="btn {{btnClass}}" ng-disabled="btnDisabled || btnLoading">'+
               '<i class="fa fa-spinner fa-spin" ng-if="btnLoading"></i>'+
               '<i class="{{btnIcon}}" ng-if="btnIcon && !btnLoading"></i>'+
               ' <span ng-transclude></span>'+
               '</button>'].join(''),
    scope: {
      btnLoading: '=',
      btnDisabled: '=',
      btnIcon: '@',
      btnType: '@',
      btnClass: '@'
    },
    transclude: true
  };
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
