angular.module('firebaseAdminApp')

.factory("foodDb", function($firebase, firebaseUrl){
  var ref = new Firebase(firebaseUrl+"/food");
  var db = $firebase(ref);
  return {
    getRef: function(){return ref;},
    get: function(){return db;},
    getChildRef: function(child){return ref.child(child);},
    getChild: function(child){return $firebase(this.getChildRef(child));}
  };
})

.factory("courseDb", function($firebase, firebaseUrl){
  var ref = new Firebase(firebaseUrl+"/course");
  var db = $firebase(ref);
  return {
    getRef: function(){return ref;},
    get: function(){return db;}
  };
})

.factory("firebaseUtils", function(){
  var service = {
    generateIdFromText: function(firebaseDb, text){
      return generateId(firebaseDb, getSlug(text));
    },
    findById: findById
  };

  function findById(firebaseDb, id){
    for(var i in firebaseDb){
      if(i[0] !== '$' && firebaseDb[i].id === id){
        return firebaseDb[i];
      }
    }
  }

  function generateId(firebaseDb, slug, index){
    var id = index ? slug+'-'+index : slug;
    if(findById(firebaseDb, id)){
      return generateId(firebaseDb, slug, index ? index+1 : 2);
    } else {
      return id;
    }
  }

  return service;
})

.factory("formTmp", function($localStorage){
  return {
    set: function(key){
      if(!$localStorage.forms){$localStorage.forms = {};}
      if(!$localStorage.forms[key]){$localStorage.forms[key] = {};}
      return $localStorage.forms[key];
    },
    reset: function(key){
      angular.copy({}, $localStorage.forms[key]);
    }
  };
});