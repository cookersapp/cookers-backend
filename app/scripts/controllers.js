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


.controller('RecipesCtrl', function($rootScope, $scope, RecipeSrv, CrudBuilder, Utils){
  if(!$rootScope.config.recipes){
    angular.extend($rootScope.config, {
      recipes: {
        sort: { order: 'name' }
      }
    });
  }

  var ctx = {
    title: 'Recettes',
    header: $rootScope.config.header,
    config: {
      sort: $rootScope.config.recipes.sort
    },
    status: {
      loading: true,
      error: null
    },
    model: {
      elts: RecipeSrv.cache
    }
  };

  ctx.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: ctx.title}
  ];

  $scope.config = ctx.config;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(RecipeSrv, ctx);
  crud.init();

  $scope.sort = crud.sort;
})


.controller('RecipeCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, SelectionSrv, CrudBuilder){
  var recipeId = $stateParams.recipeId;

  // remove phone cache
  if(localStorage){localStorage.removeItem('ngStorage-data');}

  var ctx = {
    header: $rootScope.config.header,
    data: {
      weekNumber: moment().week(),
      nextSelections: []
    },
    status: {
      loading: true,
      removing: false,
      error: null,
      loadingSelections: [true, true, true, true],
      savingSelection: false
    },
    model: {
      selected: null
    }
  };

  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  loadRecipe(recipeId);
  loadNextSelections(ctx.data.weekNumber);

  $scope.eltExistsIn = CrudBuilder.eltExistsIn;

  $scope.toggleRecipeInSelection = function(weekOffset){
    var selection = ctx.data.nextSelections[weekOffset];
    if(ctx.model.selected && ctx.model.selected.id && !ctx.status.loadingSelections[weekOffset]){
      ctx.status.savingSelection = true;
      ctx.status.loadingSelections[weekOffset] = true;
      if(CrudBuilder.eltExistsIn(selection.recipes, ctx.model.selected)){
        _.remove(selection.recipes, {id: ctx.model.selected.id});
      } else {
        if(!selection){selection = {week: ctx.data.weekNumber+weekOffset, recipes: []};}
        if(!Array.isArray(selection.recipes)){selection.recipes = [];}
        selection.recipes.push(angular.copy(ctx.model.selected));
      }
      var s = SelectionSrv.process(selection);
      SelectionSrv.save(s).then(function(){
        SelectionSrv.get(ctx.data.weekNumber+weekOffset).then(function(selection){
          ctx.data.nextSelections[weekOffset] = selection;
          ctx.status.savingSelection = false;
          ctx.status.loadingSelections[weekOffset] = false;
        });
      }, function(err){
        console.log('Error', err);
        ctx.status.savingSelection = false;
        ctx.status.loadingSelections[weekOffset] = false;
      });
    }
  };

  $scope.remove = function(elt){
    if(elt && elt.id && window.confirm('Supprimer ?')){
      ctx.status.removing = true;
      RecipeSrv.remove(ctx.model.selected).then(function(){
        ctx.status.removing = false;
        $state.go('user.data.recipes');
      });
    }
  };

  $scope.eltRestUrl = function(elt){
    return RecipeSrv.getUrl(elt.id);
  };

  function loadRecipe(recipeId){
    RecipeSrv.get(recipeId).then(function(recipe){
      ctx.header.title = recipe.name;
      ctx.header.levels = [
        {name: 'Home',      state: 'user.home'},
        {name: 'Recettes',  state: 'user.data.recipes'},
        {name: recipe.name}
      ];
      ctx.model.selected = recipe;
      ctx.status.loading = false;
    }, function(err){
      console.warn('can\'t load recipe <'+recipeId+'>', err);
      ctx.status.loading = false;
      ctx.status.error = err.statusText ? err.statusText : 'Unable to load recipe <'+recipeId+'> :(';
    });
  }
  function loadNextSelections(curWeek){
    SelectionSrv.get(curWeek+1).then(function(selection){ ctx.data.nextSelections[1] = selection; ctx.status.loadingSelections[1] = false; });
    SelectionSrv.get(curWeek+2).then(function(selection){ ctx.data.nextSelections[2] = selection; ctx.status.loadingSelections[2] = false; });
    SelectionSrv.get(curWeek+3).then(function(selection){ ctx.data.nextSelections[3] = selection; ctx.status.loadingSelections[3] = false; });
  }
})


.controller('RecipeEditCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, FoodSrv, CrudBuilder, Utils, dataList){
  var recipeId = $stateParams.recipeId;

  var ctx = {
    header: $rootScope.config.header,
    config: {
      defaultValues: {
        elt: {
          category: dataList.recipeCategories[0],
          servings: {
            unit: dataList.servingUnits[0]
          },
          time: {
            unit: dataList.timeUnits[0]
          },
          images: {}
        },
        ingredients: {
          quantity: {
            unit: dataList.quantityUnits[0]
          },
          role: dataList.ingredientRoles[0]
        }
      }
    },
    data: {
      foods: FoodSrv.cache,
      recipeCategories: dataList.recipeCategories,
      servingUnits: dataList.servingUnits,
      timeUnits: dataList.timeUnits,
      quantityUnits: dataList.quantityUnits,
      ingredientRoles: dataList.ingredientRoles,
      instructionTitles: dataList.instructionTitles,
      timerColors: dataList.timerColors
    },
    status: {
      loading: true,
      saving: false,
      error: null
    },
    model: {
      selected: null,
      form: null
    }
  };

  FoodSrv.getAll().then(function(foods){
    ctx.data.foods = foods;
  }, function(err){
    console.warn('can\'t load foods', err);
  });
  
  if(recipeId){
    RecipeSrv.get(recipeId).then(function(recipe){
      init(recipe);
    }, function(err){
      console.warn('can\'t load recipe <'+recipeId+'>', err);
      ctx.status.loading = false;
      ctx.status.error = err.statusText ? err.statusText : 'Unable to load recipe <'+recipeId+'> :(';
    });
  } else {
    init(ctx.config.defaultValues.elt);
  }
  

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(RecipeSrv, ctx);

  $scope.save = function(){
    ctx.status.saving = true;
    var recipe = RecipeSrv.process(ctx.model.form, ctx.data.foods);
    RecipeSrv.save(recipe).then(function(){
      ctx.status.saving = false;
      $state.go('user.data.recipe', {recipeId: recipe.id});
    }, function(err){
      console.log('Error', err);
      ctx.status.saving = false;
    });
  };
  
  $scope.addElt = crud.addElt;
  $scope.removeElt = crud.removeElt;
  $scope.moveEltDown = crud.moveEltDown;
  
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
    ctx.header.title = recipe.name ? recipe.name : 'Nouvelle recette';
    ctx.header.levels = [
      {name: 'Home',      state: 'user.home'},
      {name: 'Recettes',  state: 'user.data.recipes'}
    ];
    if(recipe.id){
      ctx.header.levels.push({name: recipe.name, state: 'user.data.recipe({recipeId: \''+recipe.id+'\'})'});
      ctx.header.levels.push({name: 'Modification'});
    } else {
      ctx.header.levels.push({name: 'Création'});
    }
    
    ctx.model.selected = recipe;
    ctx.model.form = angular.copy(recipe);
    Utils.extendsWith(ctx.model.form, ctx.config.defaultValues.elt);
    ctx.status.loading = false;
  }
})


.controller('SelectionsCtrl', function($rootScope, $scope, SelectionSrv, RecipeSrv, CrudBuilder, Utils){
  var ctx = {
    title: 'Sélections',
    header: $rootScope.config.header,
    config: {
      sort: {order: 'week', desc: true}
    },
    data: {
      currentWeek: moment().week(),
      recipes: RecipeSrv.cache
    },
    status: {
      loading: true,
      creating: false,
      removing: false,
      saving: false,
      error: null,
    },
    model: {
      elts: SelectionSrv.cache,
      selected: null,
      form: null
    }
  };

  // custom load recipes !
  RecipeSrv.getAll().then(function(recipes){
    ctx.data.recipes = recipes;
  }, function(err){
    console.warn('can\'t load recipes', err);
  });

  ctx.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: ctx.title}
  ];

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(SelectionSrv, ctx);
  crud.init();

  $scope.toggle = crud.toggle;

  $scope.create = function(){
    ctx.status.creating = true;
    var week = ctx.data.currentWeek;
    while(_.find(ctx.model.elts, {week: week}) !== undefined){
      week++;
    }
    
    crud.save({week: week, recipes: []}).then(function(){
      ctx.status.creating = false;
    });
  };
  $scope.edit = crud.edit;
  $scope.cancelEdit = crud.cancelEdit;
  $scope.save = crud.save;
  $scope.remove = crud.remove;

  $scope.addElt = crud.addElt;
  $scope.removeElt = crud.removeElt;
  $scope.moveEltDown = crud.moveEltDown;
  $scope.eltExistsIn = crud.eltExistsIn;

  $scope.eltRestUrl = crud.eltRestUrl;
})

.controller('FoodsCtrl', function($rootScope, $scope, FoodSrv, CrudBuilder, Utils, dataList){
  if(!$rootScope.config.foods){
    angular.extend($rootScope.config, {
      foods: {
        sort: { order: 'name' }
      }
    });
  }

  var ctx = {
    title: 'Aliments',
    header: $rootScope.config.header,
    config: {
      defaultValues: {
        elt: {
          category: dataList.foodCategories[0]
        },
        prices: {
          currency: dataList.currencies[0],
          unit: dataList.quantityUnits[0]
        }
      },
      sort: $rootScope.config.foods.sort
    },
    data: {
      foodCategories: dataList.foodCategories,
      currencies: dataList.currencies,
      quantityUnits: dataList.quantityUnits
    },
    status: {
      loading: true,
      removing: false,
      saving: false,
      error: null
    },
    model: {
      elts: FoodSrv.cache,
      selected: null,
      form: null
    }
  };

  ctx.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: ctx.title}
  ];

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(FoodSrv, ctx);
  crud.init();

  $scope.sort = crud.sort;

  $scope.toggle = crud.toggle;

  $scope.create = crud.create;
  $scope.edit = crud.edit;
  $scope.cancelEdit = crud.cancelEdit;
  $scope.save = crud.save;
  $scope.remove = crud.remove;

  $scope.addElt = crud.addElt;
  $scope.removeElt = crud.removeElt;

  $scope.eltRestUrl = crud.eltRestUrl;

  $scope.isUrl = Utils.isUrl;
});
