angular.module('firebaseAdminApp')

.controller('AppCtrl', function($scope){
  'use strict';

})


.controller('HomeCtrl', function($scope){
  'use strict';

})


.controller('FoodCtrl', function($scope, foodDb, dataList, crudFactory, formProcess){
  'use strict';
  var initForm = {
    prices: []
  };
  var crud = crudFactory.create('food', initForm, foodDb, processFood);
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

  function processFood(form){
    return formProcess.food(form);
  }
})


.controller('ProductCtrl', function($scope, productDb, foodDb, dataList, crudFactory, formProcess){
  'use strict';
  var initForm = {
    prices: [],
    peremptions: []
  };
  var crud = crudFactory.create('product', initForm, productDb, processProduct);
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

  $scope.foods = foodDb.getAll();
  $scope.currencies = dataList.currencies;
  $scope.units = dataList.quantityUnits;

  function processProduct(form){
    return formProcess.product(form, $scope.foods);
  }
})


.controller('CourseCtrl', function($scope, $state, $stateParams, courseDb, foodDb, dataList, crudFactory, formProcess){
  'use strict';
  var initForm = {
    ingredients: [],
    instructions: []
  };
  var crud = crudFactory.create('course', initForm, courseDb, processCourse);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = function(elt){
    crud.fnEdit(elt);
    $state.go('app.course.edit', {id: elt.id});
  };
  $scope.cancel = function(elt){
    var id = elt.id;
    crud.fnCancel();
    if(id){
      $state.go('app.course.detail', {id: id});
    } else {
      $state.go('app.course.list');
    }
  };
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave();
    $state.go('app.course.list');
  };
  $scope.addElt = crud.fnAddElt;
  $scope.removeElt = crud.fnRemoveElt;
  $scope.moveDownElt = crud.fnMoveDownElt;

  $scope.foods = foodDb.getAll();
  $scope.categories = dataList.courseCategories;
  $scope.servings = dataList.servingUnits;
  $scope.timeUnits = dataList.timeUnits;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.foodRoles = dataList.foodRoles;

  function processCourse(form){
    return formProcess.course(form, $scope.foods);
  }

  // for detail view :
  $scope.course = {};
  if($stateParams.id){
    courseDb.get($stateParams.id, function(course){
      $scope.course = course;
    });
  }
})


.controller('MealCtrl', function($scope, mealDb, courseDb, crudFactory, formProcess){
  'use strict';
  var crud = crudFactory.create('meal', {}, mealDb, processMeal);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;

  $scope.courses = courseDb.getAll();

  function processMeal(form){
    return formProcess.meal(form, $scope.courses);
  }
})


.controller('PlanningCtrl', function($scope, planningDb, mealDb, dataList, crudFactory, formProcess){
  'use strict';
  var initForm = createInitForm(dataList.days);
  var crud = crudFactory.create('planning', initForm, planningDb, processPlanning);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = function(){
    crud.fnSave($scope.form.week.toString());
  };

  $scope.meals = mealDb.getAll();
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


.controller('BatchCtrl', function($scope, foodDb, productDb, courseDb, mealDb, planningDb, formProcess){
  'use strict';
  var foods = foodDb.getAll();
  var products = productDb.getAll();
  var courses = courseDb.getAll();
  var meals = mealDb.getAll();
  var plannings = planningDb.getAll();

  $scope.updatedenormalizedData = {
    status: '',
    launch: function(){
      if(confirm('Recopier l\'ensemble des données ?')){
        $scope.updatedenormalizedData.status = 'Lancement de la recopie de données...';
        $scope.updatedenormalizedData.status = 'Copie des données pour les produits';
        for(var i in products){
          var product = formProcess.product(products[i], foods);
          productDb.update(product);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les plats';
        for(var i in courses){
          var course = formProcess.course(courses[i], foods);
          courseDb.update(course);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les repas';
        for(var i in meals){
          var meal = formProcess.meal(meals[i], courses);
          mealDb.update(meal);
        }
        $scope.updatedenormalizedData.status = 'Copie des données pour les plannings';
        for(var i in plannings){
          var planning = formProcess.planning(plannings[i], meals);
          planningDb.update(planning);
        }
        $scope.updatedenormalizedData.status = 'Données recopiées !';
      }
    }
  };
});
