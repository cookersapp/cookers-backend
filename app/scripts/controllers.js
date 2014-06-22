angular.module('firebaseAdminApp')

.controller('AppCtrl', function($scope){
  'use strict';

})


.controller('HomeCtrl', function($scope){
  'use strict';

})


.controller('FoodCtrl', function($scope, foodDb, dataList, crudFactory){
  'use strict';
  var crud = crudFactory.create('food', foodDb, processFood);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = crud.fnCancel;
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;

  $scope.categories = dataList.foodCategories;
  $scope.currencies = dataList.currencies;
  $scope.units = dataList.quantityUnits;

  $scope.addPrice = function(){
    if(!$scope.form.prices){$scope.form.prices = [];}
    $scope.form.prices.push({});
  };
  $scope.removePrice = function(index){
    $scope.form.prices.splice(index, 1);
  };

  function processFood(food){
    return angular.copy(food);
  }
})


.controller('CourseCtrl', function($scope){
  'use strict';

})


.controller('CourseListCtrl', function($scope, courseDb){
  'use strict';
  $scope.elts = courseDb.getAll();

})


.controller('CourseCreateCtrl', function($scope, $state, foodDb, courseDb, dataList, crudFactory){
  'use strict';
  var crud = crudFactory.create('course', courseDb, processCourse);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.save = function(){
    crud.fnSave();
    $state.go('app.course.list');
  };

  $scope.foods = foodDb.getAll();
  $scope.categories = dataList.courseCategories;
  $scope.servings = dataList.servingUnits;
  $scope.timeUnits = dataList.timeUnits;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.foodRoles = dataList.foodRoles;

  $scope.addIngredient = function(){
    if(!$scope.form.ingredients){$scope.form.ingredients = [];}
    $scope.form.ingredients.push({});
  };
  $scope.removeIngredient = function(index){
    $scope.form.ingredients.splice(index, 1);
  };
  $scope.moveDownIngredient = function(index){
    if(index < $scope.form.ingredients.length-1){ // do nothing on last element
      var elt = $scope.form.ingredients.splice(index, 1);
      $scope.form.ingredients.splice(index+1, 0, elt[0]);
    }
  };
  $scope.addInstruction = function(){
    if(!$scope.form.instructions){$scope.form.instructions = [];}
    $scope.form.instructions.push({});
  };
  $scope.removeInstruction = function(index){
    $scope.form.instructions.splice(index, 1);
  };

  function processCourse(course){
    var result = angular.copy(course);
    var totalPrice = 0;
    if(result.ingredients){
      for(var i in result.ingredients){
        var ingredient = result.ingredients[i];
        var foodKey = _.findKey($scope.foods, {id: ingredient.food.id});
        var foodObj = $scope.foods[foodKey];
        ingredient.food.name = foodObj.name;
        ingredient.food.category = foodObj.category;
        totalPrice += getPriceForQuantity(ingredient.quantity, foodObj.prices);
      }
    }
    result.price = {
      value: totalPrice/result.servings.value,
      unit: '€/personne'
    };
    return result;
  }

  function getPriceForQuantity(quantity, prices){
    // TODO
    console.log('Find price for :');
    console.log(quantity);
    console.log(prices);
    return 0;
  }
})


.controller('MealCtrl', function($scope, mealDb, courseDb, crudFactory){
  'use strict';
  var crud = crudFactory.create('meal', mealDb, processMeal);
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
  var crud = crudFactory.create('planning', planningDb, processPlanning);
  $scope.elts = crud.elts;
  $scope.form = crud.form;
  $scope.edit = crud.fnEdit;
  $scope.cancel = function(){
    crud.fnCancel();
    createDaysIfNotExist($scope.form);
  };
  $scope.remove = crud.fnRemove;
  $scope.save = crud.fnSave;
  $scope.save = function(){
    $scope.form.name = $scope.form.week.toString();
    crud.fnSave();
    createDaysIfNotExist($scope.form);
  };

  $scope.meals = mealDb.getAll();
  $scope.days = dataList.days;
  createDaysIfNotExist($scope.form);

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
  function createDaysIfNotExist(elt){
    if(!elt.days){
      elt.days = [];
      for(var i in $scope.days){
        elt.days.push({name: $scope.days[i], lunch: {recommended: ''}, dinner: {recommended: ''}});
      }
    }
  }
});
