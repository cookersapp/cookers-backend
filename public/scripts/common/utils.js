angular.module('app')

.factory('CollectionUtils', function(){
  'use strict';
  var service = {
    clear: clear,
    copy: copy,
    updateElt: updateElt,
    upsertElt: upsertElt,
    removeElt: removeElt,
    toMap: toMap,
    toArray: toArray,
    length: length,
    isEmpty: isEmpty
  };

  function clear(col){
    if(Array.isArray(col)){
      while(col.length > 0) { col.pop(); }
    } else {
      for(var i in col){
        delete col[i];
      }
    }
  }

  function copy(src, dest){
    if(Array.isArray(dest)){
      clear(dest);
      for(var i in src){
        dest.push(src[i]);
      }
    }
  }

  function _updateElt(collection, selector, elt){
    var foundElt = _.find(collection, selector);
    if(foundElt){
      var replacedElt = angular.copy(foundElt);
      angular.copy(elt, foundElt);
      return replacedElt;
    }
  }

  function updateElt(collection, elt){
    var foundElt = _.find(collection, {id: elt.id});
    if(foundElt){
      var replacedElt = angular.copy(foundElt);
      angular.copy(elt, foundElt);
      return replacedElt;
    }
  }

  function upsertElt(collection, elt){
    var foundElt = _.find(collection, {id: elt.id});
    if(foundElt){
      var replacedElt = angular.copy(foundElt);
      angular.copy(elt, foundElt);
      return replacedElt;
    } else {
      if(Array.isArray(collection)){ collection.push(elt); }
      else { collection[elt.id] = elt; }
    }
  }

  function removeElt(collection, elt){
    _.remove(collection, {id: elt.id});
  }

  function toMap(arr){
    var map = {};
    if(Array.isArray(arr)){
      for(var i in arr){
        map[arr[i].id] = arr[i];
      }
    }
    return map;
  }

  function toArray(map, addTo){
    var arr = addTo ? addTo : [];
    for(var i in map){
      map[i].id = i;
      arr.push(map[i]);
    }
    return arr;
  }

  function length(col){
    if(Array.isArray(col)){
      return col.length;
    } else {
      return Object.keys(col).length;
    }
  }

  function isEmpty(col){
    return length(col) === 0;
  }

  return service;
})

.factory('StorageSrv', function(){
  'use strict';
  var service = {
    get:    function(key){        if(localStorage){ return JSON.parse(localStorage.getItem(key));     } },
    set:    function(key, value){ if(localStorage){ localStorage.setItem(key, JSON.stringify(value)); } },
    remove: function(key){        if(localStorage){ localStorage.removeItem(key);                     } }
  };

  return service;
})

.factory('Utils', function(){
  'use strict';
  var service = {
    createUuid: createUuid,
    isUrl: isUrl,
    extendDeep: extendDeep,
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

  function extendDeep(dest) {
    angular.forEach(arguments, function (arg) {
      if (arg !== dest) {
        angular.forEach(arg, function (value, key) {
          if (dest[key] && typeof dest[key] === 'object') {
            extendDeep(dest[key], value);
          } else {
            dest[key] = angular.copy(value);
          }
        });
      }
    });
    return dest;
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
    var elt = null;
    for(var i in arr){
      elt = _getDeep(arr[i], params.order.split('.'));
      if(typeof elt !== 'undefined'){
        break;
      }
    }
    if(typeof elt === 'boolean')      { _boolSort(arr, params.order, params.desc); }
    else if(typeof elt === 'number')  { _intSort(arr, params.order, params.desc);  }
    else if(typeof elt === 'string')  { _strSort(arr, params.order, params.desc);  }
    else {
      console.warn('Unable to find suitable sort for type <'+(typeof elt)+'>', elt);
    }
  }
  function _strSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aStr = _getDeep(a, attr.split('.'), '').toLowerCase();
      var bStr = _getDeep(b, attr.split('.'), '').toLowerCase();
      if(aStr > bStr)       { return 1 * (desc ? -1 : 1);   }
      else if(aStr < bStr)  { return -1 * (desc ? -1 : 1);  }
      else                  { return 0;                     }
    });
  }
  function _intSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aInt = _getDeep(a, attr.split('.'), 0);
      var bInt = _getDeep(b, attr.split('.'), 0);
      return (aInt - bInt) * (desc ? -1 : 1);
    });
  }
  function _boolSort(arr, attr, desc){
    arr.sort(function(a, b){
      var aBool = _getDeep(a, attr.split('.'), 0);
      var bBool = _getDeep(b, attr.split('.'), 0);
      return (aBool === bBool ? 0 : (aBool ? -1 : 1)) * (desc ? -1 : 1);
    });
  }

  function _getDeep(obj, params, _defaultValue){
    if(obj){
      if(params.length > 0){
        var attr = params.shift();
        return _getDeep(obj[attr], params, _defaultValue);
      } else {
        return obj;
      }
    } else {
      return _defaultValue;
    }
  }

  return service;
});
