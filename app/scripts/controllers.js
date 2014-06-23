angular.module('firebaseAdminApp')

.controller('AppCtrl', function($scope){
  'use strict';

})


.controller('HomeCtrl', function($scope){
  'use strict';

})


.controller('FoodCtrl', function($scope, foodDb, dataList, crudFactory){
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

  function processFood(food){
    return angular.copy(food);
  }
})


.controller('ProductCtrl', function($scope, productDb, foodDb, dataList, crudFactory){
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

  function processProduct(product){
    var result = angular.copy(product);
    var foodObj = _.find($scope.foods, {id: result.food.id});
    result.food.name = foodObj.name;
    result.food.category = foodObj.category;
    return result;
  }
})


.controller('CourseCtrl', function($scope, $state, $stateParams, courseDb, foodDb, dataList, priceCalculator, crudFactory){
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

  function processCourse(course){
    var result = angular.copy(course);
    if(result.ingredients){
      for(var i in result.ingredients){
        var ingredient = result.ingredients[i];
        var foodObj = _.find($scope.foods, {id: ingredient.food.id});
        ingredient.food.name = foodObj.name;
        ingredient.food.category = foodObj.category;
      }
    }
    result.price = priceCalculator.forCourse(result);
    return result;
  }

  // for detail view :
  $scope.course = {};
  if($stateParams.id){
    courseDb.get($stateParams.id, function(course){
      $scope.course = course;
    });
  }
})


.controller('MealCtrl', function($scope, mealDb, courseDb, crudFactory){
  'use strict';
  var crud = crudFactory.create('meal', {}, mealDb, processMeal);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;

  $scope.courses = courseDb.getAll();

  function processMeal(meal){
    var result = angular.copy(meal);
    updateCourse(result.starter);
    updateCourse(result.mainCourse);
    updateCourse(result.desert);
    updateCourse(result.wine);
    var difficulty = 0;
    if(result.starter && result.starter.difficulty && result.starter.difficulty > difficulty){difficulty = result.starter.difficulty;}
    if(result.mainCourse && result.mainCourse.difficulty && result.mainCourse.difficulty > difficulty){difficulty = result.mainCourse.difficulty;}
    if(result.desert && result.desert.difficulty && result.desert.difficulty > difficulty){difficulty = result.desert.difficulty;}
    if(result.wine && result.wine.difficulty && result.wine.difficulty > difficulty){difficulty = result.wine.difficulty;}
    result.difficulty = difficulty;
    return result;
  }
  function updateCourse(course){
    if(course){
      if(course.id && course.id.length > 0){
        var c = _.find($scope.courses, {id: course.id});
        angular.copy(c, course);
      } else {
        angular.copy({}, course);
      }
    }
  }
})


.controller('PlanningCtrl', function($scope, planningDb, mealDb, dataList, crudFactory){
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

  function processPlanning(planning){
    var result = angular.copy(planning);
    result.meals = [];
    for(var i in result.days){
      addMealIfNoExist(result.meals, result.days[i].lunch);
      addMealIfNoExist(result.meals, result.days[i].dinner);
    }
    return result;
  }
  function addMealIfNoExist(meals, meal){
    if(meal && meal.recommended && meal.recommended.length > 0){
      var index = _.findIndex(meals, {id: meal.recommended});
      if(index === -1){
        var m = _.find($scope.meals, {id: meal.recommended});
        meals.push(m);
      }
    }
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
});
