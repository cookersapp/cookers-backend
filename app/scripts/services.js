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

.factory('formStorage', function($localStorage){
  'use strict';
  return {
    get: function(key){
      if(!$localStorage.formStorage){$localStorage.formStorage = {};}
      if(!$localStorage.formStorage[key]){$localStorage.formStorage[key] = {};}
      return $localStorage.formStorage[key];
    },
    reset: function(key){
      angular.copy({}, $localStorage.formStorage[key]);
    }
  };
})

.factory('crudFactory', function(formStorage, Utils){
  'use strict';
  return {
    create: function(name, db, processElt){
      var elts = db.getAll();
      var form = formStorage.get(name);

      return {
        elts: elts,
        form: form,
        fnEdit: function(elt){
          angular.copy(elt, form);
        },
        fnCancel: function(){
          formStorage.reset(name);
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

          formStorage.reset(name);
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