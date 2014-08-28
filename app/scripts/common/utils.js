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
})

.factory('Utils', function($http){
  var service = {
    createUuid: createUuid,
    isUrl: isUrl,
    extendsWith: extendsWith,
    sort: sort
  };

  function createUuid(){
    function S4(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

  function isUrl(text) {
    return (/^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i).test(text);
  }

  function extendsWith(dest, src){
    for(var i in src){
      if(typeof src[i] === 'object'){
        if(dest[i] === undefined || dest[i] === null){
          dest[i] = angular.copy(src[i]);
        } else if(typeof dest[i] === 'object'){
          extendsWith(dest[i], src[i]);
        }
      } else if(typeof src[i] === 'function'){
        // nothing
      } else if(dest[i] === undefined || dest[i] === null){
        dest[i] = src[i];
      }
    }
  }

  function sort(arr, params){
    console.log('sort', params);
    if(Array.isArray(arr) && arr.length > 0){
      if(params.order === 'updated')  { _updatedSort(arr, params);  }
      else                            { _autoSort(arr, params);     }
    }
  }

  function _updatedSort(arr, params){
    arr.sort(function(a, b){
      var aInt = a.updated ? a.updated : a.created;
      var bInt = b.updated ? b.updated : b.created;
      return (aInt - bInt) * (params.desc ? -1 : 1);
    });
  }

  function _autoSort(arr, params){
    var elt = arr[0][params.order];
    if(typeof elt === 'boolean')      { _boolSort(arr, params.order, params.desc); }
    else if(typeof elt === 'number')  { _intSort(arr, params.order, params.desc);  }
    else if(typeof elt === 'string')  { _strSort(arr, params.order, params.desc);  }
    else {
      console.warn('Unable to find suitable sort for type <'+(typeof elt)+'>', elt);
    }
  }
  function _strSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aStr = a && a[attr] ? a[attr].toLowerCase() : '';
      var bStr = b && b[attr] ? b[attr].toLowerCase() : '';
      if(aStr > bStr)       { return 1 * (desc ? -1 : 1);   }
      else if(aStr < bStr)  { return -1 * (desc ? -1 : 1);  }
      else                  { return 0;                     }
    });
  }
  function _intSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aInt = a && a[attr] ? a[attr] : 0;
      var bInt = b && b[attr] ? b[attr] : 0;
      return (aInt - bInt) * (desc ? -1 : 1);
    });
  }
  function _boolSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aBool = a && a[attr] ? a[attr] : 0;
      var bBool = b && b[attr] ? b[attr] : 0;
      return (aBool === bBool ? 0 : (aBool ? -1 : 1)) * (desc ? -1 : 1);
    });
  }

  return service;
});
