angular.module('firebaseAdminApp')


.controller('FoodCtrl', function($scope, foodDb, dataList, firebaseFactory, formProcess, firebaseUrl){
  'use strict';
  var initForm = {
    prices: []
  };
  var crud = firebaseFactory.createCrud('food', initForm, foodDb, processFood);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;
  $scope.addElt = crud.fnAddElt;
  $scope.removeElt = crud.fnRemoveElt;

  $scope.categories = dataList.foodCategories;
  $scope.currencies = dataList.currencies;
  $scope.units = dataList.quantityUnits;
  
  $scope.restUrl = function(elt){
    return firebaseUrl+'/foods/'+elt.id+'.json';
  };

  function processFood(form){
    return formProcess.food(form);
  }
})


.controller('ProductCtrl', function($scope, productDb, foodDb, dataList, firebaseFactory, formProcess, firebaseUrl){
  'use strict';
  var initForm = {
    prices: [],
    peremptions: []
  };
  var crud = firebaseFactory.createCrud('product', initForm, productDb, processProduct);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave($scope.form.barcode);
  };
  $scope.addElt = crud.fnAddElt;
  $scope.removeElt = crud.fnRemoveElt;

  $scope.foods = foodDb.sync();
  $scope.currencies = dataList.currencies;
  $scope.units = dataList.quantityUnits;
  
  $scope.restUrl = function(elt){
    return firebaseUrl+'/products/'+elt.id+'.json';
  };

  function processProduct(form){
    return formProcess.product(form, $scope.foods);
  }
})


.controller('RecipeCtrl', function($scope, $state, $stateParams, recipeDb, foodDb, dataList, firebaseFactory, formProcess, firebaseUrl){
  'use strict';
  var initForm = {
    ingredients: [],
    instructions: []
  };
  var crud = firebaseFactory.createCrud('recipe', initForm, recipeDb, processRecipe);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = function(elt){
    crud.fnEdit(elt);
    $state.go('app.recipe.edit', {id: elt.id});
  };
  $scope.cancel = function(elt){
    var id = elt.id;
    crud.fnCancel();
    if(id){
      $state.go('app.recipe.detail', {id: id});
    } else {
      $state.go('app.recipe.list');
    }
  };
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave();
    $state.go('app.recipe.list');
  };
  $scope.addElt = crud.fnAddElt;
  $scope.removeElt = crud.fnRemoveElt;
  $scope.moveDownElt = crud.fnMoveDownElt;

  $scope.foods = foodDb.sync();
  $scope.categories = dataList.recipeCategories;
  $scope.servings = dataList.servingUnits;
  $scope.timeUnits = dataList.timeUnits;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.foodRoles = dataList.foodRoles;
  
  $scope.restUrl = function(elt){
    return firebaseUrl+'/recipes/'+elt.id+'.json';
  };

  function processRecipe(form){
    return formProcess.recipe(form, $scope.foods);
  }

  // for detail view :
  $scope.recipe = {};
  if($stateParams.id){
    recipeDb.get($stateParams.id).then(function(recipe){
      $scope.recipe = recipe;
    });
  }
})


.controller('WeekrecipesCtrl', function($scope, weekrecipeDb, recipeDb, firebaseFactory, formProcess, firebaseUrl){
  'use strict';
  var initForm = {
    recipes: []
  };
  var crud = firebaseFactory.createCrud('weekrecipe', initForm, weekrecipeDb, processWeekrecipe);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave($scope.form.week.toString());
  };
  $scope.addElt = crud.fnAddElt;
  $scope.removeElt = crud.fnRemoveElt;
  $scope.moveDownElt = crud.fnMoveDownElt;

  $scope.recipes = recipeDb.sync();
  
  $scope.restUrl = function(elt){
    return firebaseUrl+'/weekrecipes/'+elt.id+'.json';
  };

  function processWeekrecipe(form){
    return formProcess.weekrecipe(form, $scope.recipes);
  }
})


.controller('MealCtrl', function($scope, mealDb, recipeDb, firebaseFactory, formProcess){
  'use strict';
  var crud = firebaseFactory.createCrud('meal', {}, mealDb, processMeal);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;

  $scope.recipes = recipeDb.sync();

  function processMeal(form){
    return formProcess.meal(form, $scope.recipes);
  }
})


.controller('PlanningCtrl', function($scope, planningDb, mealDb, dataList, firebaseFactory, formProcess){
  'use strict';
  var initForm = createInitForm(dataList.days);
  var crud = firebaseFactory.createCrud('planning', initForm, planningDb, processPlanning);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave($scope.form.week.toString());
  };

  $scope.meals = mealDb.sync();
  $scope.days = dataList.days;

  function processPlanning(form){
    return formProcess.planning(form, $scope.meals);
  }

  function createInitForm(days){
    var form = {
      days: []
    };
    for(var i in days){
      form.days.push({name: days[i], lunch: {recommended: ''}, dinner: {recommended: ''}});
    }
    return form;
  }
})


.controller('BatchCtrl', function($scope, foodDb, productDb, recipeDb, weekrecipeDb, mealDb, planningDb, formProcess){
  'use strict';
  var foods = foodDb.sync();
  var products = productDb.sync();
  var recipes = recipeDb.sync();
  var weekrecipes = weekrecipeDb.sync();
  var meals = mealDb.sync();
  var plannings = planningDb.sync();

  $scope.updatedenormalizedData = {
    status: '',
    launch: function(){
      if(window.confirm('Recopier l\'ensemble des données ?')){
        $scope.updatedenormalizedData.status = 'Lancement de la recopie de données...';
        $scope.updatedenormalizedData.status = 'Copie des données pour les produits';
        for(var i in products){
          var product = formProcess.product(products[i], foods);
          productDb.update(product);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les recettes';
        for(var j in recipes){
          var recipe = formProcess.recipe(recipes[j], foods);
          recipeDb.update(recipe);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les recettes de la semaine';
        for(var k in weekrecipes){
          var weekrecipe = formProcess.weekrecipe(weekrecipes[k], recipes);
          weekrecipeDb.update(weekrecipe);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les repas';
        for(var l in meals){
          var meal = formProcess.meal(meals[l], recipes);
          mealDb.update(meal);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les plannings';
        for(var m in plannings){
          var planning = formProcess.planning(plannings[m], meals);
          planningDb.update(planning);
        }
        $scope.updatedenormalizedData.status = 'Données recopiées !';
      }
    }
  };
})


.controller('EmptyCtrl', function(){});
