angular.module('firebaseAdminApp')

.controller('AppCtrl', function($scope){
  'use strict';

})
.controller('HomeCtrl', function($scope){
  'use strict';

})
.controller('FoodCtrl', function($scope, $firebase, foodDb, foodConst){
  'use strict';
  $scope.elts = foodDb.get();
  $scope.categories = foodConst.categories;
  $scope.create = {};
  $scope.edited = null;

  $scope.$watch('create.name', function(name){
    $scope.create.id = getSlug(name);
  });
  
  $scope.edit = function(key, elt){
    angular.copy(elt, $scope.create);
    $scope.edited = key;
  };
  $scope.cancel = function(){
    $scope.create = {};
    $scope.edited = null;
  };
  $scope.remove = function(key){
    $scope.elts.$remove(key);
  };
  $scope.save = function(){
    if($scope.edited){
      $scope.elts[$scope.edited] = $scope.create;
      $scope.elts.$save($scope.edited);
    } else {
      $scope.elts.$add($scope.create);
    }
    $scope.create = {};
    $scope.edited = null;
  };
});
