'use strict';

angular.module('app')

.controller('LoginCtrl', function ($scope, $state, AuthSrv){
  $scope.credentials = {
    email: '',
    password: '',
    loading: false,
    error: ''
  };

  $scope.login = function(){
    $scope.credentials.loading = true;
    AuthSrv.login($scope.credentials).then(function(user){
      $scope.credentials.loading = false;
      $state.go('user.home');
    }, function(error){
      $scope.credentials.password = '';
      $scope.credentials.loading = false;
      $scope.credentials.error = error.message;
    });
  };
})


.controller('MainCtrl', function($rootScope, $scope, $state, AuthSrv){
  $rootScope.config = {
    header: {
      title: '',
      levels: [{name: 'Home'}]
    }
  };

  $scope.logout = function(){
    AuthSrv.logout().then(function(){
      $state.go('anon.login');
    });
  };
})


.controller('HomeCtrl', function($rootScope){
  $rootScope.config.header.levels = [
    {name: 'Home'}
  ];
})

.controller('DashboardCtrl', function($rootScope, $scope){
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Dashboard'}
  ];
  
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


.controller('RecipesCtrl', function($rootScope, $scope, RecipeSrv, Utils){
  $rootScope.config.header.title = 'Recettes';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Recettes'}
  ];
  if(!$rootScope.config.recipes){
    angular.extend($rootScope.config, {
      recipes: {
        sort: { order: 'name' }
      }
    });
  }

  $scope.sort = $rootScope.config.recipes.sort;
  $scope.recipes = RecipeSrv.cache;
  Utils.sort($scope.recipes, $scope.sort);
  $rootScope.config.header.title = 'Recettes ('+$scope.recipes.length+')';
  
  RecipeSrv.getAll().then(function(recipes){
    $scope.recipes = recipes;
    Utils.sort($scope.recipes, $scope.sort);
    $rootScope.config.header.title = 'Recettes ('+$scope.recipes.length+')';
  }, function(err){
    console.warn('can\'t load recipes', err);
  });

  $scope.sortRecipes = function(order, desc){
    if($scope.sort.order === order){$scope.sort.desc = !$scope.sort.desc;}
    else {$scope.sort.order = order; $scope.sort.desc = desc? desc : false;}
    Utils.sort($scope.recipes, $scope.sort);
  };
})


.controller('RecipeCtrl', function($rootScope, $scope, $stateParams, RecipeSrv){
  var recipeId = $stateParams.recipeId;
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Recettes', state: 'user.data.recipes'}
  ];
  
  $scope.recipe = null;
  RecipeSrv.get(recipeId).then(function(recipe){
    $rootScope.config.header.title = recipe.name;
    $rootScope.config.header.levels.push({name: recipe.name});
    $scope.recipe = recipe;
  });

  $scope.restUrl = function(recipe){
    return RecipeSrv.getUrl(recipe.id);
  };
});
