angular.module('firebaseAdminApp')

.directive('source', function(Utils){
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'views/directives/source.html',
    replace: true,
    scope: {
      data: '='
    },
    link: function(scope, element, attr){
      scope.isLink = function(data){
        return typeof data === 'string' && Utils.isURL(data);
      };
    }
  }
})

.directive('mediaCrushUpload', function(){
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'views/directives/mediaCrushUpload.html',
    replace: true,
    scope: {
      ngModel: '='
    },
    link: function(scope, element, attr){
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
  }
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
      var listener = function(){
        safeApply(function(){
          attr.multiple ? ngModelCtrl.$setViewValue(element[0].files) : ngModelCtrl.$setViewValue(element[0].files[0]);
        });
      }
      element.bind('change', listener);

      function safeApply(fn){
        if(!scope.$$phase) {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }
  }
});