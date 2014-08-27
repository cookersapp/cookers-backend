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


.controller('RecipeCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, SelectionSrv){
  var recipeId = $stateParams.recipeId;

  // remove phone cache
  if(localStorage){localStorage.removeItem('ngStorage-data');}

  $scope.status = {
    loading: true,
    loadingSelections: [true, true, true, true],
    adding: false,
    error: null
  };
  $scope.recipe = null;
  $scope.weekNumber = moment().week();
  $scope.nextSelections = [];
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
  SelectionSrv.get($scope.weekNumber+1).then(function(selection){ $scope.nextSelections[1] = selection; $scope.status.loadingSelections[1] = false; });
  SelectionSrv.get($scope.weekNumber+2).then(function(selection){ $scope.nextSelections[2] = selection; $scope.status.loadingSelections[2] = false; });
  SelectionSrv.get($scope.weekNumber+3).then(function(selection){ $scope.nextSelections[3] = selection; $scope.status.loadingSelections[3] = false; });

  $scope.existInSelection = function(selection){
    if($scope.recipe && $scope.recipe.id && selection && selection.recipes && selection.recipes.length > 0){
      return _.find(selection.recipes, {id: $scope.recipe.id}) !== undefined;
    } else {
      return false;
    }
  };
  $scope.addRecipeToSelection = function(weekOffset){
    var selection = $scope.nextSelections[weekOffset];
    if($scope.recipe && $scope.recipe.id && !$scope.status.loadingSelections[weekOffset]){
      $scope.status.adding = true;
      $scope.status.loadingSelections[weekOffset] = true;
      if(!$scope.existInSelection(selection)){
        if(!selection){selection = {week: $scope.weekNumber+weekOffset, recipes: []};}
        if(!selection.recipes || !Array.isArray(selection.recipes)){selection.recipes = [];}
        selection.recipes.push($scope.recipe);
      } else {
        _.remove(selection.recipes, {id: $scope.recipe.id});
      }
      var s = SelectionSrv.process(selection);
      SelectionSrv.save(s).then(function(){
        SelectionSrv.get($scope.weekNumber+weekOffset).then(function(selection){
          $scope.nextSelections[weekOffset] = selection;
          $scope.status.adding = false;
          $scope.status.loadingSelections[weekOffset] = false;
        });
      });
    }
  };

  $scope.remove = function(){
    if($scope.recipe && $scope.recipe.id && window.confirm('Supprimer cette recette ?')){
      RecipeSrv.remove($scope.recipe).then(function(){
        $state.go('user.data.recipes');
      });
    }
  };

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
    if(Array.isArray(arr)){
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

  // for phone preview
  $scope.timerDuration = function(timer){
    if(timer && timer.steps && timer.steps.length > 0){
      var lastStep = timer.steps[timer.steps.length-1];
      return lastStep.time ? lastStep.time : 0;
    } else {
      return timer && timer.seconds ? timer.seconds : 0;
    }
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
})


.controller('SelectionsCtrl', function($rootScope, $scope, SelectionSrv, RecipeSrv, Utils){
  $rootScope.config.header.title = 'Sélections';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Sélections'}
  ];

  $scope.status = {
    loading: true,
    actions: {
      adding: false,
      removing: false,
      saving: false
    },
    showRecipeSearch: false,
    error: null
  };
  $scope.currentWeek = moment().week();
  $scope.selected = null;
  $scope.selections = SelectionSrv.cache;
  Utils.sort($scope.selections, {order: 'week', desc: true});
  $rootScope.config.header.title = 'Sélections ('+$scope.selections.length+')';
  $scope.recipes = RecipeSrv.cache;
  loadSelections();
  loadRecipes();

  $scope.toggle = function(selection){
    if($scope.selected && selection && $scope.selected.selection.id === selection.id){ $scope.selected = null; }
    else {
      $scope.selected = {
        shouldSave: false,
        selection: angular.copy(selection) 
      };
    }
    $scope.status.showRecipeSearch = false;
  };

  $scope.existInSelection = function(selection, recipe){
    if(recipe && recipe.id && selection && selection.recipes && selection.recipes.length > 0){
      return _.find(selection.recipes, {id: recipe.id}) !== undefined;
    } else {
      return false;
    }
  };
  $scope.addRecipe = function(selection, recipe){
    if(selection && recipe && recipe.id){
      if(!selection.recipes || !Array.isArray(selection.recipes)){selection.recipes = [];}
      if(_.find(selection.recipes, {id: recipe.id}) === undefined){
        selection.recipes.push(recipe);
        $scope.selected.shouldSave = true;
      }
    }
  };
  $scope.moveRecipeDown = function(selection, index){
    if(selection && selection.recipes && Array.isArray(selection.recipes)){
      if(index < selection.recipes.length-1){ // do nothing on last element
        var elt = selection.recipes.splice(index, 1)[0];
        selection.recipes.splice(index+1, 0, elt);
        $scope.selected.shouldSave = true;
      }
    }
  };
  $scope.removeRecipe = function(selection, index){
    if(selection && selection.recipes && Array.isArray(selection.recipes)){
      selection.recipes.splice(index, 1);
      $scope.selected.shouldSave = true;
    }
  };

  $scope.addSelection = function(){
    $scope.status.actions.adding = true;
    var week = $scope.currentWeek;
    while(_.find($scope.selections, {week: week}) !== undefined){
      week++;
    }
    var selection = SelectionSrv.process({
      week: week,
      recipes: []
    });
    SelectionSrv.save(selection).then(function(){
      loadSelections().then(function(){
        $scope.toggle(_.find($scope.selections, {id: week.toString()}));
        $scope.status.actions.adding = false;
      });
    }, function(err){
      console.log('Error', err);
      $scope.status.actions.adding = false;
    });
  };
  $scope.removeSelection = function(selection){
    if(selection && selection.id && window.confirm('Supprimer cette sélection ?')){
      $scope.status.actions.removing = true;
      SelectionSrv.remove(selection).then(function(){
        loadSelections().then(function(){
          $scope.selected = null;
          $scope.status.actions.removing = false;
        });
      }, function(err){
        console.log('Error', err);
        $scope.status.actions.removing = false;
      });
    }
  };
  $scope.saveSelection = function(selection){
    $scope.status.actions.saving = true;
    SelectionSrv.save(selection).then(function(){
      loadSelections().then(function(){
        $scope.selected.shouldSave = false;
        $scope.status.actions.saving = false;
      });
    }, function(err){
      console.log('Error', err);
      $scope.status.actions.saving = false;
    });
  };

  $scope.restUrl = function(selection){
    return SelectionSrv.getUrl(selection.id);
  };

  function loadSelections(){
    return SelectionSrv.getAll().then(function(selections){
      $rootScope.config.header.title = 'Sélections ('+selections.length+')';
      Utils.sort(selections, {order: 'week', desc: true});
      $scope.selections = selections;
      $scope.status.loading = false;
    }, function(err){
      console.warn('can\'t load selections', err);
      $scope.status.loading = false;
      $scope.status.error = err.statusText ? err.statusText : 'Unable to load selections :(';
    });
  }
  function loadRecipes(){
    return RecipeSrv.getAll().then(function(recipes){
      $scope.recipes = recipes;
    }, function(err){
      console.warn('can\'t load recipes', err);
    });
  }
})

.controller('FoodsCtrl', function($rootScope, $scope, FoodSrv, Utils, dataList){
  var title = 'Aliments';
  $rootScope.config.header.title = 'Aliments';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: title}
  ];
  if(!$rootScope.config.foods){
    angular.extend($rootScope.config, {
      foods: {
        sort: { order: 'name' }
      }
    });
  }

  var defaultFood = {
    category: dataList.foodCategories[0]
  };
  $scope.defaultPrice = {
    currency: dataList.currencies[0],
    unit: dataList.quantityUnits[0]
  };

  $scope.status = {
    loading: true,
    actions: {
      editing: false,
      removing: false,
      saving: false
    },
    error: null
  };
  $scope.foodCategories = dataList.foodCategories;
  $scope.currencies = dataList.currencies;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.selected = null;
  $scope.form = null;
  $scope.sort = $rootScope.config.foods.sort;
  $scope.foods = FoodSrv.cache;
  Utils.sort($scope.foods, $scope.sort);
  $rootScope.config.header.title = title+' ('+$scope.foods.length+')';
  loadFoods();

  $scope.sortFoods = function(order, desc){
    if($scope.sort.order === order){$scope.sort.desc = !$scope.sort.desc;}
    else {$scope.sort.order = order; $scope.sort.desc = desc? desc : false;}
    Utils.sort($scope.foods, $scope.sort);
  };

  $scope.toggleFood = function(food){
    if($scope.selected && food && $scope.selected.id === food.id){ $scope.selected = null; }
    else {
      $scope.selected = food;
    }
    $scope.status.actions.editing = false;
  };

  $scope.addFood = function(){
    $scope.status.actions.editing = true;
    $scope.form = angular.copy(defaultFood);
  };
  $scope.edit = function(food){
    $scope.status.actions.editing = true;
    $scope.form = angular.copy(food);
  };
  $scope.cancelEdit = function(){
    $scope.status.actions.editing = false;
    $scope.form = null;
  };
  $scope.remove = function(food){
    if(food && food.id && window.confirm('Supprimer cet aliment ?')){
      $scope.status.actions.removing = true;
      FoodSrv.remove(food).then(function(){
        loadFoods().then(function(){
          $scope.selected = null;
          $scope.status.actions.removing = false;
        });
      }, function(err){
        console.log('Error', err);
        $scope.status.actions.removing = false;
      });
    }
  };
  $scope.save = function(){
    $scope.status.actions.saving = true;
    var food = FoodSrv.process($scope.form);
    var foodId = food.id;
    FoodSrv.save(food).then(function(){
      loadFoods().then(function(){
        $scope.selected = _.find($scope.foods, {id: foodId});
        $scope.status.actions.editing = false;
        $scope.status.actions.saving = false;
      });
    }, function(err){
      console.log('Error', err);
      $scope.status.actions.saving = false;
    });
  };

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

  $scope.isUrl = Utils.isUrl;
  $scope.restUrl = function(food){
    return FoodSrv.getUrl(food.id);
  };

  function loadFoods(){
    return FoodSrv.getAll().then(function(foods){
      $scope.foods = foods;
      Utils.sort($scope.foods, $scope.sort);
      $rootScope.config.header.title = title+' ('+$scope.foods.length+')';
      $scope.status.loading = false;
    }, function(err){
      console.warn('can\'t load foods', err);
      $scope.status.loading = false;
      $scope.status.error = err.statusText ? err.statusText : 'Unable to load recipes :(';
    });
  }
});