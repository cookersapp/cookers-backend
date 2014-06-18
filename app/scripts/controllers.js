angular.module('firebaseAdminApp')

.controller('AppCtrl', function($scope){
  'use strict';

})


.controller('HomeCtrl', function($scope){
  'use strict';

})


.controller('FoodCtrl', function($scope, $firebase, foodDb, firebaseUtils, formTmp, dataList){
  'use strict';
  $scope.elts = foodDb.get();
  $scope.categories = dataList.foodCategories;
  $scope.currencies = dataList.currencies;
  $scope.units = dataList.quantityUnits;
  $scope.create = formTmp.set('food');

  $scope.edit = function(key, elt){
    angular.copy(elt, $scope.create);
    $scope.create.key = key;
  };
  $scope.cancel = function(){
    formTmp.reset('food');
  };
  $scope.remove = function(key){
    if(confirm('Supprimer cet élément ?')){
      $scope.elts.$remove(key);
    }
  };
  $scope.addPrice = function(){
    if(!$scope.create.prices){$scope.create.prices = [];}
    $scope.create.prices.push({});
  };
  $scope.removePrice = function(index){
    $scope.create.prices.splice(index, 1);
  }
  $scope.save = function(){
    if($scope.create.key){
      var key = $scope.create.key;
      delete $scope.create.key;
      $scope.create.updated = Date.now();
      $scope.elts[key] = $scope.create;
      $scope.elts.$save(key);
    } else {
      $scope.create.id = firebaseUtils.generateIdFromText($scope.elts, $scope.create.name);
      $scope.create.added = Date.now();
      $scope.elts.$add($scope.create);
    }

    formTmp.reset('food');
  };
})


.controller('CourseCtrl', function($scope){
  'use strict';

})


.controller('CourseListCtrl', function($scope, courseDb){
  'use strict';
  $scope.elts = courseDb.get();

})


.controller('CourseCreateCtrl', function($scope, $state, foodDb, courseDb, dataList, formTmp){
  'use strict';
  $scope.elts = courseDb.get();
  $scope.foods = foodDb.get();
  $scope.categories = dataList.courseCategories;
  $scope.servings = dataList.servingUnits;
  $scope.timeUnits = dataList.timeUnits;
  $scope.quantityUnits = dataList.quantityUnits;
  $scope.foodRoles = dataList.foodRoles;
  $scope.create = formTmp.set('course');

  $scope.addIngredient = function(){
    if(!$scope.create.ingredients){$scope.create.ingredients = [];}
    $scope.create.ingredients.push({});
  };
  $scope.removeIngredient = function(index){
    $scope.create.ingredients.splice(index, 1);
  }
  $scope.moveDownIngredient = function(index){
    if(index < $scope.create.ingredients.length-1){ // do nothing on last element
      var elt = $scope.create.ingredients.splice(index, 1);
      $scope.create.ingredients.splice(index+1, 0, elt[0]);
    }
  };
  $scope.addInstruction = function(){
    if(!$scope.create.instructions){$scope.create.instructions = [];}
    $scope.create.instructions.push({});
  };
  $scope.removeInstruction = function(index){
    $scope.create.instructions.splice(index, 1);
  }

  $scope.save = function(){
    $scope.elts.$add(processNewCourse($scope.create));
    formTmp.reset('course');
    $state.go('app.course.list');
  };

  function processNewCourse(newCourse){
    var result = angular.copy(newCourse);
    result.added = Date.now();
    result.id = getSlug(result.name);
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
      unit: "€/personne"
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


.controller('MealCtrl', function($scope, $firebase, mealDb, courseDb, firebaseUtils, formTmp){
  'use strict';
  $scope.elts = mealDb.get();
  $scope.courses = courseDb.get();
  $scope.create = formTmp.set('meal');

  $scope.edit = function(key, elt){
    angular.copy(elt, $scope.create);
    $scope.create.key = key;
  };
  $scope.cancel = function(){
    formTmp.reset('meal');
  };
  $scope.remove = function(key){
    if(confirm('Supprimer cet élément ?')){
      $scope.elts.$remove(key);
    }
  };
  $scope.save = function(){
    if($scope.create.key){
      var key = $scope.create.key;
      delete $scope.create.key;
      $scope.create.updated = Date.now();
      $scope.elts[key] = processMeal($scope.create);
      $scope.elts.$save(key);
    } else {
      $scope.create.id = firebaseUtils.generateIdFromText($scope.elts, $scope.create.name);
      $scope.create.added = Date.now();
      $scope.elts.$add(processMeal($scope.create));
    }

    formTmp.reset('meal');
  };
  
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
        var c = firebaseUtils.findById($scope.courses, course.id);
        angular.copy(c, course);
      } else {
        angular.copy({}, course);
      }
    }
  }
});
