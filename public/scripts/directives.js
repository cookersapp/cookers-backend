angular.module('app')

.directive('user', function(CacheSrv){
  'use strict';
  return {
    restrict: 'E',
    template: '<span>{{username}}</span>',
    scope: {
      id: '='
    },
    link: function(scope, element, attr){
      scope.username = scope.id;
      CacheSrv.getUser(scope.id).then(function(user){
        scope.username = user.email;
      });
    }
  };
})

.directive('eventData', function(CacheSrv){
  'use strict';
  return {
    restrict: 'E',
    template: '<span>{{event.data | json}}</span>',
    scope: {
      event: '='
    },
    link: function(scope, element, attr){
      if(scope.event && scope.event.data){
        if(scope.event.data.recipe){
          CacheSrv.getRecipe(scope.event.data.recipe).then(function(recipe){
            scope.event.data.recipe = recipe.name;
          });
        }
      }
    }
  };
})

.directive('sort', function(){
  'use strict';
  return {
    restrict: 'A',
    template: ['<i class="fa fa-sort-desc" ng-if="isActive() && !sort.desc"></i>'+
               '<i class="fa fa-sort-asc" ng-if="isActive() && sort.desc"></i>'+
               '<i class="fa fa-sort none" ng-if="!isActive()"></i>'+
               ' <span ng-transclude></span>'].join(''),
    scope: {
      name: '@',
      sort: '='
    },
    transclude: true,
    link: function(scope, element, attr){
      element.addClass('sort');

      scope.$watch('sort.order', function(val){
        if(val === scope.name){
          element.addClass('active');
        } else {
          element.removeClass('active');
        }
      });

      scope.isActive = function(){
        return scope.name === scope.sort.order;
      };
    }
  };
})

.directive('loadingButton', function(){
  'use strict';
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

/*
 * Load bootstrap affix plugin
 *  Plugin find elements on onload but angular markup is set after :(
 */
.directive('ngAffix', function(){
  'use strict';
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
  };
})

.directive('source', function(Utils){
  'use strict';
  return {
    restrict: 'A',
    templateUrl: 'assets/views/directives/source.html',
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
    templateUrl: 'assets/views/directives/mediaCrushUpload.html',
    replace: true,
    scope: {
      ngModel: '=',
      format: '@'
    },
    link: function(scope, element, attr){
      scope.file = '';
      scope.loading = false;
      scope.media = null;

      scope.$watch('file', function(val){
        if(typeof val === 'object'){
          //safeApply(function(){
          scope.loading = true;
          scope.image = null;
          scope.ngModel = '';
          //});
          MediaCrush.upload(val, function(media){
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
  'use strict';
  // from https://github.com/angular/angular.js/issues/1375#issuecomment-15690425
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
  'use strict';
  var directive = {
    transclude: true,
    template: '<div class="widget" ng-transclude></div>',
    restrict: 'EA'
  };
  return directive;
})

.directive('rdWidgetHeader', function(){
  'use strict';
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
  'use strict';
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
  'use strict';
  var directive = {
    restrict: 'AE',
    template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
  };
  return directive;
});
