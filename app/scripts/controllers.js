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
  $scope.currencies = foodConst.currencies;
  $scope.units = foodConst.units;
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
    if(confirm('Supprimer cet élément ?')){
      $scope.elts.$remove(key);
    }
  };
  $scope.save = function(){
    if($scope.edited){
      $scope.elts[$scope.edited] = $scope.create;
      $scope.elts.$save($scope.edited);
    } else {
      $scope.create.added = Date.now();
      $scope.elts.$add($scope.create);
    }
    $scope.create = {};
    $scope.edited = null;
  };

  
  $scope.priceFor = null;
  $scope.createPrice = {};
  
  $scope.addPrice = function(key){
    $scope.priceFor = key;
  };
  $scope.cancelPrice = function(){
    $scope.priceFor = null;
    $scope.createPrice = {};
  };
  $scope.savePrice = function(){
    $scope.createPrice.added = Date.now();
    $scope.createPrice.unit = $scope.createPrice.currency+'/'+$scope.createPrice.unit;
    delete $scope.createPrice.currency;
    foodDb.getChild($scope.priceFor+'/prices').$add($scope.createPrice);
    $scope.priceFor = null;
    $scope.createPrice = {};
  };
});
