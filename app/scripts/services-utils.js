angular.module('firebaseAdminApp')

.factory('Utils', function($interval){
  'use strict';
  var service = {
    generateIdFromText: function(collection, text){
      return generateId(collection, getSlug(text));
    },
    isUrl: function(text) {
      return (/^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i).test(text);
    },
    clock: addClock,
    cancelClock: removeClock
  };

  function generateId(collection, slug, index){
    var id = index ? slug+'-'+index : slug;

    if(_.find(collection, {id: id})){
      return generateId(collection, slug, index ? index+1 : 2);
    } else {
      return id;
    }
  }

  var clockElts = [];
  var clockTimer = null;
  function addClock(fn){
    if(clockElts.length === 0){ startClock(); }
    return clockElts.push(fn) - 1;
  }
  function removeClock(index){
    if(0 <= index && index < clockElts.length){clockElts.splice(index, 1);}
    if(clockElts.length === 0){ stopClock(); }
  }
  function startClock(){
    if(clockTimer === null){
      clockTimer = $interval(function(){
        for(var i in clockElts){
          clockElts[i]();
        }
      }, 1000);
    }
  }
  function stopClock(){
    if(clockTimer !== null){
      $interval.cancel(clockTimer);
      clockTimer = null;
    }
  }

  return service;
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

.factory('firebaseFactory', function($rootScope, $http, firebaseUrl, formStorage, Utils){
  'use strict';
  var service = {
    createCollection: createCollection,
    createCrud: createCrud
  };

  function createElt(snapshot, useId){
    var elt = snapshot.val();
    if(!useId){
      elt.$name = snapshot.name();
    }
    return elt;
  }
  function findIndex(array, elt, useId) {
    var index = -1, length = array ? array.length : 0;
    while(++index < length) {
      if((useId && array[index].id && array[index].id === elt.id) || (!useId && array[index].$name && array[index].$name === elt.$name)) {
        return index;
      }
    }
    return -1;
  }
  function objectToArray(obj){
    var arr = [];
    for(var  i in obj){
      arr.push(obj[i]);
    }
    return arr;
  }
  function exist(collection, elt, useId){
    return findIndex(collection, elt, useId) > -1;
  }
  function onError(error){
    if(error){
      console.log('Error', error);
      window.alert('Synchronization failed.');
    }
  }

  function createCollection(name, useId){
    var collectionUrl = firebaseUrl+'/'+name;
    var collectionRef = new Firebase(collectionUrl);
    var collection = [];
    var syncs = [];
    var addedCallbacks = [], removedCallbacks = [], updatedCallbacks = [];

    collectionRef.on('child_added', function(childSnapshot, prevChildName) {
      $rootScope.safeApply(function(){
        var newElt = createElt(childSnapshot, useId);
        collection.push(newElt);

        // sync all collections
        for(var i in syncs){
          syncs[i].collection.push(syncs[i].builder(newElt));
        }

        // dispatch events
        for(var j in addedCallbacks){
          addedCallbacks[j](newElt, 'added');
        }
      });
    });
    collectionRef.on('child_removed', function(oldChildSnapshot) {
      $rootScope.safeApply(function(){
        var oldElt = createElt(oldChildSnapshot, useId);
        var index = findIndex(collection, oldElt, useId);
        collection.splice(index, 1);

        // sync all collections
        for(var i in syncs){
          syncs[i].collection.splice(index, 1);
        }

        // dispatch events
        for(var j in removedCallbacks){
          removedCallbacks[j](oldElt, 'removed');
        }
      });
    });
    collectionRef.on('child_changed', function(childSnapshot, prevChildName) {
      $rootScope.safeApply(function(){
        var elt = createElt(childSnapshot, useId);
        var index = findIndex(collection, elt, useId);
        collection.splice(index, 1, elt);

        // sync all collections
        for(var i in syncs){
          syncs[i].collection.splice(index, 1, syncs[i].builder(elt));
        }

        // dispatch events
        for(var j in updatedCallbacks){
          updatedCallbacks[j](elt, 'updated');
        }
      });
    });

    var service = {
      name: name,
      ref: collectionRef,
      collection: collection,
      sync: function(builder){
        // Warn, some concurrencie issues may appear... :(
        // It's the case if some event came when the reference collection is copied...

        if(!builder || typeof builder !== 'function'){
          builder = function(elt){return elt;};
        }
        var arr = [];
        for(var i in collection){
          arr[i] = builder(collection[i]);
        }
        syncs.push({
          collection: arr,
          builder: builder
        });
        return arr;
      },
      getAll: function(){
        return $http.get(collectionUrl+'.json').then(function(result){
          return objectToArray(result.data);
        });
      },
      get: function(id){
        return $http.get(collectionUrl+'/'+id+'.json').then(function(result){
          return result.data;
        });
      },
      add: function(elt){
        var id = elt.id;
        if(!exist(collection, elt, useId)){
          if(id){
            collectionRef.child(id).set(elt, onError);
          } else {
            var msgRef = collectionRef.push();
            elt.id = msgRef.name();
            msgRef.set(elt);
          }
        } else {
          window.alert('Element with id <'+id+'> already exists !', id);
        }
      },
      remove: function(elt){
        var id = elt.id;
        if(exist(collection, elt, useId)){
          collectionRef.child(id).remove(onError);
        } else {
          window.alert('Element with id <'+id+'> don\'t exist !', id);
        }
      },
      update: function(elt){
        var id = elt.id;
        if(exist(collection, elt, useId)){
          delete elt.$name;
          collectionRef.child(id).set(elt, onError);
        } else {
          window.alert('Element with id <'+id+'> don\'t exist !', id);
        }
      },
      onChildAdded: function(callback){addedCallbacks.push(callback);},
      onChildRemoved: function(callback){removedCallbacks.push(callback);},
      onChildUpdated: function(callback){updatedCallbacks.push(callback);},
      onChange: function(callback){
        addedCallbacks.push(callback);
        removedCallbacks.push(callback);
        updatedCallbacks.push(callback);
      }
    };

    return service;
  }

  function createCrud(name, initForm, db, processElt){
    var elts = db.collection;
    var form = formStorage.get(name, initForm);

    function fnEdit(elt){
      angular.copy(elt, form);
      for(var i in initForm){
        if(!form[i]){
          form[i] = initForm[i];
        }
      }
    }
    function fnCancel(){
      formStorage.reset(name, initForm);
    }
    function fnRemove(elt){
      if(window.confirm('Supprimer cet élément ?')){
        db.remove(elt);
      }
    }
    function fnSave(textId){
      if(form.id){
        form.updated = Date.now();
        db.update(processElt(form));
      } else {
        form.id = Utils.generateIdFromText(elts, textId ? textId : form.name);
        form.created = Date.now();
        db.add(processElt(form));
      }

      formStorage.reset(name, initForm);
    }
    function fnAddElt(list, elt){
      if(!elt){elt = {};}
      else {elt = angular.copy(elt);}
      elt.created = Date.now();
      list.push(elt);
    }
    function fnAddEltSafe(obj, attr, elt){
      if(!Array.isArray(obj[attr])){obj[attr] = [];}
      fnAddElt(obj[attr], elt);
    }
    function fnRemoveElt(list, index){
      list.splice(index, 1);
    }
    function fnMoveDownElt(list, index){
      if(index < list.length-1){ // do nothing on last element
        var elt = list.splice(index, 1)[0];
        list.splice(index+1, 0, elt);
      }
    }

    return {
      elts: elts,
      form: form,
      fnEdit: fnEdit,
      fnCancel: fnCancel,
      fnRemove: fnRemove,
      fnSave: fnSave,
      fnAddElt: fnAddElt,
      fnAddEltSafe: fnAddEltSafe,
      fnRemoveElt: fnRemoveElt,
      fnMoveDownElt: fnMoveDownElt
    };
  }

  return service;
});