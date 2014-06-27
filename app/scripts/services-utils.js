angular.module('firebaseAdminApp')

.factory('Utils', function(){
  'use strict';
  var service = {
    generateIdFromText: function(collection, text){
      return generateId(collection, getSlug(text));
    },
    isUrl: function(text) {
      return (/^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i).test(text);
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

  function findIndexWithId(array, id) {
    var index = -1, length = array ? array.length : 0;
    while(++index < length) {
      if(array[index].id && array[index].id === id) {
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
  function exist(collection, elt){
    return findIndexWithId(collection, elt.id) > -1;
  }
  function onError(error){
    if(error){
      console.log('Error', error);
      window.alert('Synchronization failed.');
    }
  }

  function createCollection(name){
    var collectionUrl = firebaseUrl+'/'+name;
    var collectionRef = new Firebase(collectionUrl);
    var collection = [];

    collectionRef.on('child_added', function(childSnapshot, prevChildName) {
      $rootScope.safeApply(function(){
        collection.push(childSnapshot.val());
      });
    });
    collectionRef.on('child_removed', function(oldChildSnapshot) {
      $rootScope.safeApply(function(){
        var index = findIndexWithId(collection, oldChildSnapshot.val().id);
        collection.splice(index, 1);
      });
    });
    collectionRef.on('child_changed', function(childSnapshot, prevChildName) {
      $rootScope.safeApply(function(){
        var index = findIndexWithId(collection, childSnapshot.val().id);
        collection.splice(index, 1, childSnapshot.val());
      });
    });

    var service = {
      sync: function(){ return collection; },
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
        if(!exist(collection, elt)){
          collectionRef.child(id).set(elt, onError);
        } else {
          window.alert('Element with id <'+id+'> already exists !', id);
        }
      },
      remove: function(elt){
        var id = elt.id;
        if(exist(collection, elt)){
          collectionRef.child(id).remove(onError);
        } else {
          window.alert('Element with id <'+id+'> don\'t exist !', id);
        }
      },
      update: function(elt){
        var id = elt.id;
        if(exist(collection, elt)){
          collectionRef.child(id).set(elt, onError);
        } else {
          window.alert('Element with id <'+id+'> don\'t exist !', id);
        }
      }
    };

    return {
      name: name,
      ref: collectionRef,
      collection: collection,
      service: service
    };
  }

  function createCrud(name, initForm, db, processElt){
    var elts = db.sync();
    var form = formStorage.get(name, initForm);

    return {
      elts: elts,
      form: form,
      fnEdit: function(elt){
        angular.copy(elt, form);
        for(var i in initForm){
          if(!form[i]){
            form[i] = initForm[i];
          }
        }
      },
      fnCancel: function(){
        formStorage.reset(name, initForm);
      },
      fnRemove: function(elt){
        if(window.confirm('Supprimer cet élément ?')){
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

  return service;
});