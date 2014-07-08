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

  $scope.foods = foodDb.collection;
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

  $scope.foods = foodDb.collection;
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

  $scope.recipes = recipeDb.collection;

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

  $scope.recipes = recipeDb.collection;

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

  $scope.meals = mealDb.collection;
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
  var foods = foodDb.collection;
  var products = productDb.collection;
  var recipes = recipeDb.collection;
  var weekrecipes = weekrecipeDb.collection;
  var meals = mealDb.collection;
  var plannings = planningDb.collection;

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


.controller('UsersCtrl', function($scope, firebaseFactory){
  'use strict';
  var connectedUsersDb = firebaseFactory.createCollection('connected');
  $scope.connectedUsers = connectedUsersDb.collection;
  $scope.mapMarkers = connectedUsersDb.sync(function(user){
    var ret = {};
    if(user){
      if(user.launchs && user.launchs.length > 0){
        ret.time = user.launchs[0].timestamp;
        if(user.launchs[0].coords){
          ret.lat = user.launchs[0].coords.latitude;
          ret.lng = user.launchs[0].coords.longitude;
        }
      }
      if(user.profile){
        ret.title = user.profile.mail;
      }
      if(user.device){
        ret.message = user.device.platform+' '+user.device.version+', '+user.device.model;
      }
    }
    return ret;
  });

  $scope.mapCenter = {
    name: 'Paris',
    lat: 48.855,
    lng: 2.34,
    zoom: 12
  };
})


.controller('UserinfosCtrl', function($scope, $sce, userinfoDb, firebaseFactory, firebaseUrl){
  'use strict';

  var info = {
    type: 'info',
    content: 'Cette application est une version beta (encore en développement). Nous faisons le maximum pour vous proposer la meilleure expérience possible et nous espérons que vous serez indulgent en cas de problème.<br>Par ailleurs, nous sommes preneur de toute <a href="#/app/feedback">remarque ou idée</a>.<br><b>Bon appétit ! ;)</b>',
    created: Date.now(),
    isProd: true
  };


  var crud = firebaseFactory.createCrud('userinfo', {}, userinfoDb, processUserinfo);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;

  $scope.infoTypes = ['default', 'success', 'info', 'warning', 'danger'];
  /*$scope.$watch('form.content', function(newVal){
    $scope.trustedContent = $sce.trustAsHtml(newVal);
  });*/

  $scope.restUrl = function(elt){
    return firebaseUrl+'/userinfos/'+elt.id+'.json';
  };
  $scope.trust = function(html){
    return $sce.trustAsHtml(html);
  };

  function processUserinfo(form){
    var ret = angular.copy(form);
    return ret;
  }
})


.controller('PurchasesCtrl', function($scope, $filter, firebaseFactory){
  'use strict';
  var purchaseDb = firebaseFactory.createCollection('logs/buy');
  $scope.purchases = purchaseDb.sync(function(purchase){
    var ret = {};
    if(purchase){
      ret.device = purchase.device;
      ret.recipe = purchase.recipe;
      ret.ingredient = purchase.ingredient;
      ret.title = purchase.ingredient;
      if(purchase.position){
        ret.time = purchase.position.timestamp;
        if(purchase.position.coords){
          ret.lat = purchase.position.coords.latitude;
          ret.lng = purchase.position.coords.longitude;
        }
      }
    }
    return ret;
  });

  $scope.mapCenter = {
    name: 'Paris',
    lat: 48.855,
    lng: 2.34,
    zoom: 12
  };
})


.controller('LoginCtrl', function($rootScope, $scope){
  'use strict';
  $scope.login = function(login, pass){
    $rootScope.auth.login('password', {email: login, password: pass});
  };
})


.controller('AccessDeniedCtrl', function($scope, $stateParams){
  'use strict';
  $scope.prevUrl = $stateParams.prevUrl;
})


.controller('EmptyCtrl', function(){});
