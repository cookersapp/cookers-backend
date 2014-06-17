angular.module('firebaseAdminApp')

.factory("foodDb", function($firebase, firebaseUrl) {
  var ref = new Firebase(firebaseUrl+"/food");
  var db = $firebase(ref);
  return {
    getRef: function(){return ref;},
    get: function(){return db;},
    getChildRef: function(child){return ref.child(child);},
    getChild: function(child){return $firebase(this.getChildRef(child));}
  };
});