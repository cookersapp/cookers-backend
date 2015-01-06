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


.controller('StoresCtrl', function($rootScope, $scope, StoresSrv, CrudUtils, dataList){
  'use strict';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Magasins'}
  ];

  $scope.data = {
    ionicColors: dataList.ionicColors
  };

  var defaultSort = {order: 'name'};
  var defaultFormElt = {};
  $scope.crud = CrudUtils.createCrudCtrl('Magasins', $rootScope.config.header, StoresSrv, defaultSort, defaultFormElt);
})


.controller('StoreProductsCtrl', function($rootScope, $scope, $stateParams, StoresSrv, StoreProductsSrv, CrudUtils, dataList){
  'use strict';
  var storeId = $stateParams.storeId;
  StoresSrv.get(storeId).then(function(store){
    $scope.store = store;
    $rootScope.config.header.levels = [
      {name: 'Home', state: 'user.home'},
      {name: 'Magasins', state: 'user.data.stores'},
      {name: store.name},
      {name: 'Produits'}
    ];
  });

  $scope.data = {
    currencies: dataList.currencies,
    quantityUnits: dataList.quantityUnits,
    promoBenefits: dataList.promoBenefits,
    recommandationCategories: dataList.recommandationCategories
  };

  var defaultSort = {order: 'product'};
  var defaultFormElt = {
    store: storeId,
    price: {currency: dataList.currencies[0]},
    genericPrice: {currency: dataList.currencies[0], unit: dataList.quantityUnits[0]}
  };
  var crud = CrudUtils.createCrudCtrl('Produits', $rootScope.config.header, StoreProductsSrv.create(storeId), defaultSort, defaultFormElt);
  $scope.crud = crud;

  $scope.$watch('crud.data.form.promos', function(val){
    $scope.data.hasPromo = !!val;
    if(!$scope.data.hasPromo && $scope.crud.data.form){ delete $scope.crud.data.form.promo; }
  });
  $scope.$watch('crud.data.form.recommandations', function(val){
    $scope.data.hasRecommandations = !!val;
    if(!$scope.data.hasRecommandations && $scope.crud.data.form){ delete $scope.crud.data.form.recommandations; }
  });
  $scope.defaultFormPromo = {
    benefit: { category: dataList.promoBenefits[0] }
  };
  $scope.defaultFormRecommandation = {
    category: dataList.recommandationCategories[0]
  };
})


.controller('ProductsCtrl', function($rootScope, $scope, ProductsSrv, FoodSrv, CrudUtils, dataList){
  'use strict';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Produits'}
  ];

  var defaultSort = {order: 'name'};
  var defaultFormElt = {};
  $scope.crud = CrudUtils.createCrudCtrl('Produits', $rootScope.config.header, ProductsSrv, defaultSort, defaultFormElt);


  // update foodId !
  var selectedFoodId = null;
  $scope.data = {};
  FoodSrv.getAll().then(function(foods){
    if(Array.isArray(foods)){
      foods.sort(function(a, b){
        if(a.name > b.name){ return 1; }
        else if(a.name < b.name){ return -1; }
        else { return 0; }
      });
      $scope.data.foods = foods;
    }
  });
  $scope.$watch('crud.data.selectedElt', function(elt){
    if(elt){ selectedFoodId = elt.foodId; }
  });
  $scope.$watch('crud.data.selectedElt.foodId', function(value, old){
    if($scope.crud.data.selectedElt && value && value !== selectedFoodId){
      var barcode = $scope.crud.data.selectedElt.barcode;
      var foodId = value;
      ProductsSrv.updateFoodId(barcode, foodId).then(function(){
        selectedFoodId = foodId;
      }, function(){
        alert('Can\'t update foodId <'+foodId+'> for '+barcode+' !');
        console.error('SelectedElt', $scope.crud.data.selectedElt);
        $scope.crud.data.selectedElt.foodId = selectedFoodId;
      });
    }
  });
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
      elts: FoodSrv.cacheArr,
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
      elts: RecipeSrv.cacheArr
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
  SelectionSrv.get(ctx.data.weekNumber+1, false, true).then(function(selection){ ctx.data.nextSelections[1] = selection; ctx.status.loadingSelections[1] = false; });
  SelectionSrv.get(ctx.data.weekNumber+2, false, true).then(function(selection){ ctx.data.nextSelections[2] = selection; ctx.status.loadingSelections[2] = false; });
  SelectionSrv.get(ctx.data.weekNumber+3, false, true).then(function(selection){ ctx.data.nextSelections[3] = selection; ctx.status.loadingSelections[3] = false; });

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
      process: FoodSrv.cacheArr,
      foods: FoodSrv.cacheArr,
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
    data: {
      currentWeek: moment().week(),
      recipes: RecipeSrv.cacheArr
    },
    status: {
      loading: true,
      creating: false,
      removing: false,
      saving: false,
      error: null,
    },
    model: {
      elts: SelectionSrv.cacheArr,
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

  $scope.create = function(){};
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


.controller('GlobalmessagesCtrl', function($rootScope, $scope, GlobalmessageSrv, CrudUtils, dataList){
  'use strict';
  $rootScope.config.header.levels = [
    {name: 'Home', state: 'user.home'},
    {name: 'Global messages'}
  ];

  $scope.data = {
    messageCategories: dataList.messageCategories,
    appVersions: dataList.appVersions
  };

  var defaultSort = {order: 'sticky'};
  var defaultFormElt = {
    category: dataList.messageCategories[0],
    versions: [dataList.appVersions[0], dataList.appVersions[1]]
  };
  $scope.crud = CrudUtils.createCrudCtrl('Global messages', $rootScope.config.header, GlobalmessageSrv, defaultSort, defaultFormElt);
})

.controller('BatchsCtrl', function($rootScope, $scope, $http, $q, $window, FoodSrv, RecipeSrv, SelectionSrv, isProd){
  'use strict';
  var ctx = {
    title: 'Batchs',
    breadcrumb: [
      {name: 'Home', state: 'user.home'},
      {name: 'Batchs'}
    ],
    header: $rootScope.config.header,
    config: {
      isProd: isProd,
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
      },
      loadDb: {
        fn: function(){
          return $http.get('http://cookers.herokuapp.com/api/export').then(function(result){
            if(result && result.data && result.data.data){
              return result.data.data;
            }
          });
        },
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

  $scope.saveDb = function(){
    if(isProd){
      $window.alert('Impossible à faire en prod !!!')
    } else {
      var attr = 'loadDb';
      ctx.config[attr].status.saving = true;
      return $http.post('/api/clearAndImport', ctx.config[attr].model).then(function(result){
        ctx.config[attr].status.saving = false;
        ctx.config[attr].status.saved = true;
      });

    }
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
    var selectionsPromise = SelectionSrv.getAll(true, true);
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
})

.controller('Sample1Ctrl', function($rootScope, $scope){
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
});
