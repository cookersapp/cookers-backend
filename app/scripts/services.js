angular.module('firebaseAdminApp')

.factory('foodDb', function(firebaseFactory){
  'use strict';
  var firebaseCollection = firebaseFactory.createCollection('food');
  return firebaseCollection.service;
})

.factory('productDb', function(firebaseFactory){
  'use strict';
  var firebaseCollection = firebaseFactory.createCollection('product');
  return firebaseCollection.service;
})

.factory('courseDb', function(firebaseFactory){
  'use strict';
  var firebaseCollection = firebaseFactory.createCollection('course');
  return firebaseCollection.service;
})

.factory('mealDb', function(firebaseFactory){
  'use strict';
  var firebaseCollection = firebaseFactory.createCollection('meal');
  return firebaseCollection.service;
})

.factory('planningDb', function(firebaseFactory){
  'use strict';
  var firebaseCollection = firebaseFactory.createCollection('planning');
  return firebaseCollection.service;
})

.factory('priceCalculator', function(foodDb, unitConversion){
  'use strict';
  var foods = foodDb.getAll();
  var service = {
    forCourse: coursePrice
  };

  function getPriceForQuantity(quantity, prices){
    var price = _.find(prices, {unit: quantity.unit});
    if(price){
      return price.value * quantity.value;
    } else {
      for(var i in unitConversion){
        var src = _.find(unitConversion[i].convert, {unit: quantity.unit});
        if(src){
          for(var j in prices){
            var dest = _.find(unitConversion[i].convert, {unit: prices[j].unit});
            if(dest){
              return prices[j].value * quantity.value * (src.factor / dest.factor);
            }
          }
        }
      }
      console.warn('Unable to find price for <'+quantity.unit+'> in ', prices);
      return 0;
    }
  }

  function coursePrice(course){
    var currency = '€';
    var totalPrice = 0;
    if(course && course.ingredients){
      for(var i in course.ingredients){
        var ingredient = course.ingredients[i];
        var food = _.find(foods, {id: ingredient.food.id});
        if(food){
          totalPrice += getPriceForQuantity(ingredient.quantity, food.prices);
        }
      }
    }

    if(course && course.servings){
      return {
        value: totalPrice/course.servings.value,
        currency: currency,
        unit: course.servings.unit
      };
    } else {
      return {
        value: totalPrice,
        currency: currency,
        unit: null
      };
    }
  }

  return service;
})

.factory('Utils', function(){
  'use strict';
  var service = {
    generateIdFromText: function(collection, text){
      return generateId(collection, getSlug(text));
    },
    isURL: function(text) {
      return /^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i.test(text);
    }
  };

  function generateId(collection, slug, index){
    var id = index ? slug+'-'+index : slug;

    if(_.find(collection, {id: id})){
      return generateId(collection, slug, index ? index+1 : 2);
    } else {
      return id;
    }
  }

  return service;
})

.factory('formProcess', function(priceCalculator){
  'use strict';
  return {
    food: function(formFood){
      return angular.copy(formFood);
    },
    product: function(formProduct, foods){
      var product = angular.copy(formProduct);
      var foodObj = _.find(foods, {id: product.food.id});
      angular.copy(foodObj, product.food);
      return product;
    },
    course: function(formCourse, foods){
      var course = angular.copy(formCourse);
      if(course.ingredients){
        for(var i in course.ingredients){
          var ingredient = course.ingredients[i];
          var foodObj = _.find(foods, {id: ingredient.food.id});
          angular.copy(foodObj, ingredient.food);
        }
      }
      course.price = priceCalculator.forCourse(course);
      return course;
    },
    meal: function(formMeal, courses){
      var meal = angular.copy(formMeal);
      var mealCourses = [meal.starter, meal.mainCourse, meal.desert, meal.wine];
      meal.difficulty = 0;
      for(var i in mealCourses){
        var course = mealCourses[i];
        if(course){
          if(course.id && course.id.length > 0){
            var c = _.find(courses, {id: course.id});
            angular.copy(c, course);
          } else {
            angular.copy({}, course);
          }

          if(course.difficulty && course.difficulty > meal.difficulty){
            meal.difficulty = course.difficulty;
          }
        }
      }
      return meal;
    },
    planning: function(formPlanning, meals){
      var planning = angular.copy(formPlanning);
      planning.meals = [];
      for(var i in planning.days){
        var dayMeals = [planning.days[i].lunch, planning.days[i].dinner];
        for(var j in dayMeals){
          var meal = dayMeals[j];
          if(meal && meal.recommended && meal.recommended.length > 0){
            var index = _.findIndex(planning.meals, {id: meal.recommended});
            if(index === -1){
              var m = _.find(meals, {id: meal.recommended});
              planning.meals.push(m);
            }
          }
        }
      }
      return planning;
    }
  };
})

.factory('formStorage', function($localStorage){
  'use strict';
  return {
    get: function(key, value){
      if(!$localStorage.formStorage){$localStorage.formStorage = {};}
      if(!$localStorage.formStorage[key]){$localStorage.formStorage[key] = value ? value : {};}
      return $localStorage.formStorage[key];
    },
    reset: function(key, value){
      angular.copy(value ? value : {}, $localStorage.formStorage[key]);
    }
  };
})

.factory('crudFactory', function(formStorage, Utils){
  'use strict';
  return {
    create: function(name, initForm, db, processElt){
      var elts = db.getAll();
      var form = formStorage.get(name, initForm);

      return {
        elts: elts,
        form: form,
        fnEdit: function(elt){
          angular.copy(elt, form);
        },
        fnCancel: function(){
          formStorage.reset(name, initForm);
        },
        fnRemove: function(elt){
          if(confirm('Supprimer cet élément ?')){
            db.remove(elt);
          }
        },
        fnSave: function(textId){
          if(form.id){
            form.updated = Date.now();
            db.update(processElt(form));
          } else {
            form.id = Utils.generateIdFromText(elts, textId ? textId : form.name);
            form.added = Date.now();
            db.add(processElt(form));
          }

          formStorage.reset(name, initForm);
        },
        fnAddElt: function(list){
          list.push({
            added: Date.now()
          });
        },
        fnRemoveElt: function(list, index){
          list.splice(index, 1);
        },
        fnMoveDownElt: function(list, index){
          if(index < list.length-1){ // do nothing on last element
            var elt = list.splice(index, 1)[0];
            list.splice(index+1, 0, elt);
          }
        }
      };
    }
  };
})

.factory('firebaseFactory', function($rootScope, firebaseUrl){
  'use strict';
  function findIndexWithId(array, id) {
    var index = -1, length = array ? array.length : 0;
    while(++index < length) {
      if(array[index].id && array[index].id === id) {
        return index;
      }
    }
    return -1;
  }
  function exist(collection, elt){
    return findIndexWithId(collection, elt.id) > -1;
  }
  function onError(error){
    if(error){
      console.log('Error', error);
      alert('Synchronization failed.');
    }
  }

  return {
    createCollection: function(name){
      var firebaseRef = new Firebase(firebaseUrl+'/'+name);
      var collection = [];

      firebaseRef.on('child_added', function(childSnapshot, prevChildName) {
        $rootScope.safeApply(function(){
          collection.push(childSnapshot.val());
        });
      });
      firebaseRef.on('child_removed', function(oldChildSnapshot) {
        $rootScope.safeApply(function(){
          var index = findIndexWithId(collection, oldChildSnapshot.val().id);
          collection.splice(index, 1);
        });
      });
      firebaseRef.on('child_changed', function(childSnapshot, prevChildName) {
        $rootScope.safeApply(function(){
          var index = findIndexWithId(collection, childSnapshot.val().id);
          collection.splice(index, 1, childSnapshot.val());
        });
      });

      var service = {
        getAll: function(){ return collection; },
        get: function(id, callback){
          firebaseRef.child(id).once('value', function(dataSnapshot){
            callback(dataSnapshot.val());
          });
        },
        add: function(elt){
          var id = elt.id;
          if(!exist(collection, elt)){
            firebaseRef.child(id).set(elt, onError);
          } else {
            alert('Element with id <'+id+'> already exists !', id);
          }
        },
        remove: function(elt){
          var id = elt.id;
          if(exist(collection, elt)){
            firebaseRef.child(id).remove(onError);
          } else {
            alert('Element with id <'+id+'> don\'t exist !', id);
          }
        },
        update: function(elt){
          var id = elt.id;
          if(exist(collection, elt)){
            firebaseRef.child(id).set(elt, onError);
          } else {
            alert('Element with id <'+id+'> don\'t exist !', id);
          }
        }
      };

      return {
        name: name,
        ref: firebaseRef,
        collection: collection,
        service: service
      };
    }
  };
});