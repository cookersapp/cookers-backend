'use strict';

angular.module('app')

.factory('CollectionUtils', function($q, Utils){
  var service = {
    replace: replace,
    replaceWithId: replaceWithId
  };

  function replace(collection, callback, elt){
    var foundElt = _.find(collection, callback);
    if(foundElt){
      var replacedElt = angular.copy(foundElt);
      angular.copy(elt, foundElt);
      return replacedElt;
    }
  }

  function replaceWithId(collection, elt){
    return replace(collection, {id: elt.id}, elt);
  }

  return service;
});
