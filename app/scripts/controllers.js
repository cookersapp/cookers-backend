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

  $scope.status = {
    loading: true,
    error: null
  };
  $scope.sort = $rootScope.config.recipes.sort;
  $scope.recipes = RecipeSrv.cache;
  Utils.sort($scope.recipes, $scope.sort);
  $rootScope.config.header.title = 'Recettes ('+$scope.recipes.length+')';
  RecipeSrv.getAll().then(function(recipes){
    $scope.recipes = recipes;
    Utils.sort($scope.recipes, $scope.sort);
    $rootScope.config.header.title = 'Recettes ('+$scope.recipes.length+')';
    $scope.status.loading = false;
  }, function(err){
    console.warn('can\'t load recipes', err);
    $scope.status.loading = false;
    $scope.status.error = err.statusText ? err.statusText : 'Unable to load recipes :(';
  });

  $scope.sortRecipes = function(order, desc){
    if($scope.sort.order === order){$scope.sort.desc = !$scope.sort.desc;}
    else {$scope.sort.order = order; $scope.sort.desc = desc? desc : false;}
    Utils.sort($scope.recipes, $scope.sort);
  };
})


.controller('RecipeCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv){
  var recipeId = $stateParams.recipeId;

  $scope.status = {
    loading: true,
    error: null
  };
  $scope.recipe = null;
  RecipeSrv.get(recipeId).then(function(recipe){
    $rootScope.config.header.title = recipe.name;
    $rootScope.config.header.levels = [
      {name: 'Home',      state: 'user.home'},
      {name: 'Recettes',  state: 'user.data.recipes'},
      {name: recipe.name}
    ];
    $scope.recipe = recipe;
    $scope.status.loading = false;
  }, function(err){
    console.warn('can\'t load recipe <'+recipeId+'>', err);
    $scope.status.loading = false;
    $scope.status.error = err.statusText ? err.statusText : 'Unable to load recipe <'+recipeId+'> :(';
  });

  $scope.remove = function(){
    if($scope.recipe && $scope.recipe.id && window.confirm('Supprimer cette recette ?')){
      RecipeSrv.remove($scope.recipe).then(function(){
        $state.go('user.data.recipes');
      });
    }
  }

  $scope.restUrl = function(recipe){
    return RecipeSrv.getUrl(recipe.id);
  };
})


.controller('RecipeEditCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, FoodSrv, dataList){
  var recipeId = $stateParams.recipeId;

  $scope.status = {
    loading: true,
    saving: false,
    error: null
  };
  var defaultRecipe = {
    category: dataList.recipeCategories[0],
    servings: {
      unit: dataList.servingUnits[0]
    },
    time: {
      unit: dataList.timeUnits[0]
    }
  };
  $scope.defaultIngredient = {
    quantity: {
      unit: dataList.quantityUnits[0]
    },
    role: dataList.ingredientRoles[0]
  };

  $scope.recipe = null;
  $scope.form = {};
  $scope.foods = [];
  if(recipeId){
    RecipeSrv.get(recipeId).then(function(recipe){
      init(recipe);
    }, function(err){
      console.warn('can\'t load recipe <'+recipeId+'>', err);
      $scope.status.loading = false;
      $scope.status.error = err.statusText ? err.statusText : 'Unable to load recipe <'+recipeId+'> :(';
    });
  } else {
    init(defaultRecipe);
  }

  FoodSrv.getAll().then(function(foods){
    $scope.foods = foods;
  }, function(err){
    console.warn('can\'t load foods', err);
  });

  $scope.selected = undefined;
  $scope.recipeCategories = dataList.recipeCategories;
  $scope.servingUnits = dataList.servingUnits;
  $scope.timeUnits = dataList.timeUnits;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.ingredientRoles = dataList.ingredientRoles;
  $scope.instructionTitles = dataList.instructionTitles;
  $scope.timerColors = dataList.timerColors;

  $scope.addElt = function(obj, attr, elt){
    if(!Array.isArray(obj[attr])){obj[attr] = [];}
    if(!elt){elt = {};}
    else {elt = angular.copy(elt);}
    elt.created = Date.now();
    obj[attr].push(elt);
  };
  $scope.removeElt = function(arr, index){
    if(Array.isArray(arr)){arr.splice(index, 1);}
  };
  $scope.moveEltDown = function(arr, index){
    if(!Array.isArray(arr)){
      if(index < arr.length-1){ // do nothing on last element
        var elt = arr.splice(index, 1)[0];
        arr.splice(index+1, 0, elt);
      }
    }
  };

  $scope.save = function(){
    $scope.status.saving = true;
    var recipe = RecipeSrv.process($scope.form, $scope.foods);
    RecipeSrv.save(recipe).then(function(){
      $scope.status.saving = false;
      $state.go('user.data.recipe', {recipeId: recipe.id});
    }, function(err){
      console.log('err', err);
      $scope.status.error = 'Unable to save recipe <'+recipe.id+'> (code: '+err+')';
      $scope.status.saving = false;
    });
  };


  function init(recipe){
    $rootScope.config.header.title = recipe.id ? recipe.name : 'Nouvelle recette';
    $rootScope.config.header.levels = [
      {name: 'Home',      state: 'user.home'},
      {name: 'Recettes',  state: 'user.data.recipes'}
    ];
    if(recipe.id){
      $rootScope.config.header.levels.push({name: recipe.name, state: 'user.data.recipe({recipeId: \''+recipe.id+'\'})'});
      $rootScope.config.header.levels.push({name: 'Modification'});
    } else {
      $rootScope.config.header.levels.push({name: 'Création'});
    }
    $scope.recipe = recipe;
    $scope.form = angular.copy(recipe);
    extendsWith($scope.form, defaultRecipe);
    $scope.status.loading = false;
  }

  function extendsWith(dest, src){
    for(var i in src){
      if(typeof src[i] === 'object'){
        if(dest[i] === undefined || dest[i] === null){
          dest[i] = angular.copy(src[i]);
        } else if(typeof dest[i] === 'object'){
          extendsWith(dest[i], src[i]);
        }
      } else if(typeof src[i] === 'function'){
        // nothing
      } else if(dest[i] === undefined || dest[i] === null){
        dest[i] = src[i];
      }
    }
  }
});
