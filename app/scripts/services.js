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