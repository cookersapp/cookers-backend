angular.module('app')

.controller('LoginCtrl', function ($scope, $state, AuthSrv){
  'use strict';
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
  'use strict';
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
  'use strict';
  $rootScope.config.header.levels = [
    {name: 'Home'}
  ];
})

.controller('DashboardCtrl', function($rootScope, $scope){
  'use strict';
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


.controller('TrackingCtrl', function($rootScope, $scope, $http, env){
  'use strict';
  var ctx = {
    model: {
      users: [],
      events: [],
      malformedEvents: []
    }
  };

  $rootScope.config.header.title = 'Tracking';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Tracking'}
  ];

  $scope.env = env;
  $scope.model = ctx.model;
  $scope.userSelected = null;
  $scope.eventSelected = null;

  $http.get('/api/v1/users').then(function(results){
    if(results && results.data){
      $scope.model.users = results.data;
    }
  });
  $http.get('/api/v1/track/events').then(function(results){
    if(results && results.data){
      $scope.model.events = results.data;
    }
  });
  $http.get('/api/v1/track/events/malformed').then(function(results){
    if(results && results.data){
      $scope.model.malformedEvents = results.data;
    }
  });

  $scope.toggleUser = function(elt){
    if($scope.userSelected === elt){$scope.userSelected = null;}
    else {$scope.userSelected = elt;}
  };
  $scope.toggleEvent = function(elt){
    if($scope.eventSelected === elt){$scope.eventSelected = null;}
    else {$scope.eventSelected = elt;}
  };

  $scope.resetApp = function(){
    if(confirm('Supprimer toutes les données de l\'application ?')){
      if(confirm('Vraiment ???')){
        $http.delete('/api/v1/reset-database').then(function(result){
          alert('Fait !');
        });
      }
    }
  };
})


.controller('RecipesCtrl', function($rootScope, $scope, RecipeSrv, CrudBuilder){
  'use strict';
  if(!$rootScope.config.recipes){
    angular.extend($rootScope.config, {
      recipes: {
        sort: { order: 'name' }
      }
    });
  }

  var ctx = {
    title: 'Recettes',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Recettes'}
    ],
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

  $scope.config = ctx.config;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(RecipeSrv, ctx);
  crud.init();

  $scope.sort = crud.sort;
})


.controller('RecipeCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, SelectionSrv, CrudBuilder, StorageSrv){
  'use strict';
  var recipeId = $stateParams.recipeId;

  // remove phone cache
  StorageSrv.remove('ngStorage-data');

  var ctx = {
    title: 'Recette',
    breadcrumb: [
      {name: 'Home',      state: 'user.home'},
      {name: 'Recettes',  state: 'user.data.recipes'},
      {name: 'Recette'}
    ],
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

  // custom load data !
  SelectionSrv.get(ctx.data.weekNumber+1, true).then(function(selection){ ctx.data.nextSelections[1] = selection; ctx.status.loadingSelections[1] = false; });
  SelectionSrv.get(ctx.data.weekNumber+2, true).then(function(selection){ ctx.data.nextSelections[2] = selection; ctx.status.loadingSelections[2] = false; });
  SelectionSrv.get(ctx.data.weekNumber+3, true).then(function(selection){ ctx.data.nextSelections[3] = selection; ctx.status.loadingSelections[3] = false; });

  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(RecipeSrv, ctx);
  crud.initForElt(recipeId);

  $scope.remove = function(elt){
    crud.remove(elt, function(){
      ctx.status.removing = false;
      $state.go('user.data.recipes');
    });
  };

  $scope.eltExistsIn = crud.eltExistsIn;
  $scope.eltRestUrl = crud.eltRestUrl;



  $scope.toggleRecipeInSelection = function(weekOffset){
    var selection = ctx.data.nextSelections[weekOffset];
    if(ctx.model.selected && ctx.model.selected.id && !ctx.status.loadingSelections[weekOffset]){
      ctx.status.savingSelection = true;
      ctx.status.loadingSelections[weekOffset] = true;
      if(selection && CrudBuilder.eltExistsIn(selection.recipes, ctx.model.selected)){
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
})


.controller('RecipeEditCtrl', function($rootScope, $scope, $state, $stateParams, RecipeSrv, FoodSrv, CrudBuilder, Utils, dataList){
  'use strict';
  var recipeId = $stateParams.recipeId;

  var ctx = {
    title: 'Nouvelle recette',
    breadcrumb: [
      {name: 'Home',      state: 'user.home'},
      {name: 'Recettes',  state: 'user.data.recipes'},
      {name: recipeId ? 'Modification' : 'Création'}
    ],
    eltState: function(elt){ return 'user.data.recipe({recipeId: \''+elt.id+'\'})'; },
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
      process: FoodSrv.cache,
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

  // custom load data !
  FoodSrv.getAll().then(function(foods){
    ctx.data.process = foods;
    ctx.data.foods = foods;
  }, function(err){
    console.warn('can\'t load foods', err);
  });

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(RecipeSrv, ctx);
  crud.initForElt(recipeId, true);

  $scope.save = function(){
    crud.save(ctx.model.form, function(elt){
      ctx.status.saving = false;
      $state.go('user.data.recipe', {recipeId: elt.id});
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
})


.controller('SelectionsCtrl', function($rootScope, $scope, SelectionSrv, RecipeSrv, CrudBuilder){
  'use strict';
  var ctx = {
    title: 'Sélections',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Sélections'}
    ],
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

  // custom load data !
  RecipeSrv.getAll().then(function(recipes){
    ctx.data.recipes = recipes;
  }, function(err){
    console.warn('can\'t load recipes', err);
  });

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(SelectionSrv, ctx, true);
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
  'use strict';
  if(!$rootScope.config.foods){
    angular.extend($rootScope.config, {
      foods: {
        sort: { order: 'name' }
      }
    });
  }

  var ctx = {
    title: 'Aliments',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Aliments'}
    ],
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
})

.controller('GlobalmessagesCtrl', function($rootScope, $scope, GlobalmessageSrv, CrudBuilder, dataList){
  'use strict';
  if(!$rootScope.config.globalmessages){
    angular.extend($rootScope.config, {
      globalmessages: {
        sort: { order: 'updated', desc: true }
      }
    });
  }

  var ctx = {
    title: 'Global messages',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Global messages'}
    ],
    header: $rootScope.config.header,
    config: {
      defaultValues: {
        elt: {
          type: dataList.messageTypes[0],
          display: dataList.messageDisplay[0],
          shouldDisplay: 'function shouldDisplayFn(message, user){\n  return true;\n}\nshouldDisplayFn(message, user);',
          exec: 'function exec(message, user){\n  \n}\nexec(message, user);',
          targets: [dataList.appVersions[0], dataList.appVersions[1], dataList.appVersions[2], dataList.appVersions[3]]
        }
      },
      sort: $rootScope.config.globalmessages.sort
    },
    data: {
      messageTypes: dataList.messageTypes,
      messageDisplay: dataList.messageDisplay,
      appVersions: dataList.appVersions
    },
    status: {
      loading: true,
      removing: false,
      saving: false,
      error: null
    },
    model: {
      elts: GlobalmessageSrv.cache,
      selected: null,
      form: null
    }
  };

  $scope.config = ctx.config;
  $scope.data = ctx.data;
  $scope.status = ctx.status;
  $scope.model = ctx.model;

  var crud = CrudBuilder.create(GlobalmessageSrv, ctx);
  crud.init();

  $scope.sort = crud.sort;

  $scope.toggle = crud.toggle;

  $scope.create = crud.create;
  $scope.edit = crud.edit;
  $scope.cancelEdit = crud.cancelEdit;
  $scope.save = crud.save;
  $scope.remove = crud.remove;

  $scope.eltRestUrl = crud.eltRestUrl;
})

.controller('BatchsCtrl', function($rootScope, $scope, $q, $window, FoodSrv, RecipeSrv, SelectionSrv){
  'use strict';
  var ctx = {
    title: 'Batchs',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Batchs'}
    ],
    header: $rootScope.config.header,
    config: {
      foods2recipes: {
        service: RecipeSrv,
        fn: processRecipesWithFoods,
        model: null,
        status: {
          preparing: false,
          saving: false,
          saved: false
        }
      },
      recipes2selections: {
        service: SelectionSrv,
        fn: processSelectionsWithRecipes,
        model: null,
        status: {
          preparing: false,
          saving: false,
          saved: false
        }
      }
    }
  };

  ctx.header.title = ctx.title;
  ctx.header.levels = ctx.breadcrumb;

  $scope.config = ctx.config;

  $scope.prepare = function(attr){
    ctx.config[attr].status.preparing = true;
    ctx.config[attr].model = null;
    ctx.config[attr].fn().then(function(res){
      ctx.config[attr].model = res;
      ctx.config[attr].status.preparing = false;
    });
  };
  $scope.save = function(attr){
    if(ctx.config[attr].model._errors.length === 0 || $window.confirm('Sure ???')){
      ctx.config[attr].status.saving = true;
      saveProcessedData(attr, ctx.config[attr].service).then(function(){
        ctx.config[attr].status.saving = false;
        ctx.config[attr].status.saved = true;
      });
    }
  };
  $scope.close = function(attr){
    ctx.config[attr].status.saved = false;
    ctx.config[attr].model = null;
  };


  function saveProcessedData(attr, DataSrv){
    var savePromises = [];
    for(var i in ctx.config[attr].model.processed){
      var data = ctx.config[attr].model.processed[i];
      savePromises.push(DataSrv.save(data));
    }
    return $q.all(savePromises);
  }


  function processRecipesWithFoods(){
    var foodsPromise = FoodSrv.getAll();
    var recipesPromise = RecipeSrv.getAll();

    return $q.all([foodsPromise, recipesPromise]).then(function(all){
      var foods = all[0], recipes = all[1], _errors = [];
      for(var i in recipes){
        for(var j in recipes[i].ingredients){
          var ingredient = recipes[i].ingredients[j];
          var foodObj = _.find(foods, {id: ingredient.food.id});
          if(foodObj){
            angular.copy(foodObj, ingredient.food);
          } else {
            var err = {
              message: 'Can\'t find ingredient <'+ingredient.food.id+'> for recipe <'+recipes[i].name+'>',
              recipe: angular.copy(recipes[i]),
              ingredient: angular.copy(ingredient)
            };
            _errors.push(err);
            console.warn(err.message, err);
          }
        }
      }
      return {
        _errors: _errors,
        updatedRecipes: recipes,
        foods: foods
      };
    }).then(function(res){
      var processedRecipes = [];
      for(var i in res.updatedRecipes){
        processedRecipes.push(RecipeSrv.process(res.updatedRecipes[i], res.foods, res._errors));
      }
      return {
        _errors: res._errors,
        processed: processedRecipes
      };
    });
  }

  function processSelectionsWithRecipes(){
    var recipesPromise = RecipeSrv.getAll();
    var selectionsPromise = SelectionSrv.getAll(true);
    return $q.all([recipesPromise, selectionsPromise]).then(function(all){
      var recipes = all[0], selections = all[1], _errors = [];
      for(var i in selections){
        for(var j in selections[i].recipes){
          var recipe = selections[i].recipes[j];
          var recipeObj = _.find(recipes, {id: recipe.id});
          if(recipeObj){
            angular.copy(recipeObj, recipe);
          } else {
            var err = {
              message: 'Can\'t find recipe <'+recipe.id+'> for selection <'+selections[i].id+'>',
              selections: angular.copy(selections[i]),
              recipe: angular.copy(recipe)
            };
            _errors.push(err);
            console.warn(err.message, err);
          }
        }
      }
      return {
        _errors: _errors,
        updatedSelections: selections
      };
    }).then(function(res){
      var processedSelections = [];
      for(var i in res.updatedSelections){
        processedSelections.push(SelectionSrv.process(res.updatedSelections[i], res._errors));
      }
      return {
        _errors: res._errors,
        processed: processedSelections
      };
    });
  }
});
