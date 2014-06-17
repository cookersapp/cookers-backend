angular.module('firebaseAdminApp')

.factory("foodDb", function($firebase, firebaseUrl) {
  var foodRef = new Firebase(firebaseUrl+"/food");
  var db = $firebase(foodRef);
  return {
    get: function(){return db;}
  };
});