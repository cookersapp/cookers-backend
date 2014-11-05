angular.module('app')

.factory('CrudUtils', function($http, $q, $window, CollectionUtils, Utils){
  var service = {
    createCrud: createCrud,
    createCrudCtrl: createCrudCtrl
  };

  /*
   * Create a service connected to a REST backend with following endpoints :
   *  - GET     /endpoint     : return an array of all values in the property 'data' of the response
   *  - GET     /endpoint/:id : return the value with the specified id in the property 'data' of the response
   *  - POST    /endpoint     : create new value with a random id an return the created value in the property 'data' of the response
   *  - PUT     /endpoint/:id : update the value with the specified id and return the updated value in the property 'data' of the response
   *  - DELETE  /endpoint/:id : delete the value with the specified id and return only the status code
   */
  function createCrud(endpointUrl, _processBreforeSave){
    var cache = [];
    var CrudSrv = {
      cache:    cache,
      getUrl:   function(_id) { return _crudGetUrl(endpointUrl, _id);                           },
      getAll:   function()    { return _crudGetAll(endpointUrl, cache);                         },
      get:      function(id)  { return _crudGet(id, endpointUrl, cache);                        },
      save:     function(elt) { return _crudSave(elt, endpointUrl, cache, _processBreforeSave); },
      remove:   function(elt) { return _crudRemove(elt, endpointUrl, cache);                    }
    };
    return CrudSrv;
  }

  /*
   * Create data and functions to use in crud controller, based on a CrudSrv
   */
  function createCrudCtrl(title, header, CrudSrv, _defaultSort, _defaultFormElt){
    var data = {
      header: header,
      elts: CrudSrv.cache ? angular.copy(CrudSrv.cache) : [],
      currentSort: _defaultSort ? _defaultSort : {},
      selectedElt: null,
      defaultFormElt: _defaultFormElt ? _defaultFormElt : {},
      form: null,
      status: {
        error: null,
        loading: true,
        saving: false,
        removing: false
      }
    };
    var ctrl = {
      data: data,
      fn: {
        sort: function(order, _desc){ _ctrlSort(order, _desc, data); },
        toggle: function(elt){ _ctrlToggle(elt, data); },
        create: function(){ _ctrlCreate(data); },
        edit: function(elt){ _ctrlEdit(elt, data); },
        cancelEdit: function(){ _ctrlCancelEdit(data); },
        save: function(_elt){ return _ctrlSave(_elt, CrudSrv, data, title); },
        remove: function(elt){ return _ctrlRemove(elt, CrudSrv, data, title); },
        eltRestUrl: function(_elt){ return _ctrlEltRestUrl(_elt, CrudSrv); }
      }
    };

    _ctrlInit(CrudSrv, data, title, _defaultSort);

    return ctrl;
  }

  function _crudGetUrl(endpointUrl, _id){
    return endpointUrl+(_id ? '/'+_id : '');
  }

  function _crudGetAll(endpointUrl, cache){
    return $http.get(_crudGetUrl(endpointUrl)).then(function(res){
      if(res && res.data && res.data.data){
        CollectionUtils.copy(res.data.data, cache);
        return res.data.data;
      }
    });
  }

  function _crudGet(id, endpointUrl, cache){
    return $http.get(_crudGetUrl(endpointUrl, id)).then(function(res){
      if(res && res.data && res.data.data){
        CollectionUtils.upsertElt(cache, res.data.data);
        return res.data.data;
      }
    });
  }

  function _crudSave(elt, endpointUrl, cache, _processBreforeSave){
    if(elt){
      if(typeof _processBreforeSave === 'function'){ _processBreforeSave(elt); }
      var promise = null;
      if(elt.id){ // update
        promise = $http.put(_crudGetUrl(endpointUrl, elt.id), elt);
      } else { // create
        promise = $http.post(_crudGetUrl(endpointUrl), elt);
      }
      return promise.then(function(res){
        if(res && res.data && res.data.data){
          CollectionUtils.upsertElt(cache, res.data.data);
          return res.data.data;
        }
      });
    } else {
      return $q.when();
    }
  }

  function _crudRemove(elt, endpointUrl, cache){
    if(elt && elt.id){
      return $http.delete(_crudGetUrl(endpointUrl, elt.id)).then(function(res){
        if(res && res.data){
          CollectionUtils.removeElt(cache, elt);
          return res.data;
        }
      });
    } else {
      return $q.when();
    }
  }

  function _ctrlInit(CrudSrv, data, title, _defaultSort){
    if(data.header){ data.header.title = title+' ('+data.elts.length+')'; }
    if(_defaultSort){Utils.sort(data.elts, _defaultSort);}

    CrudSrv.getAll().then(function(elts){
      if(data.header){ data.header.title = title+' ('+elts.length+')'; }
      if(data.currentSort){ Utils.sort(elts, data.currentSort); }
      data.elts = elts;
      data.status.loading = false;
    }, function(err){
      console.warn('can\'t load '+title, err);
      data.status.loading = false;
      data.status.error = err.statusText ? err.statusText : 'Unable to load '+title+' :(';
    });
  }

  function _ctrlSort(order, _desc, data){
    if(data.currentSort.order === order){
      data.currentSort.desc = !data.currentSort.desc;
    } else {
      data.currentSort = {order: order, desc: _desc ? _desc : false};
    }
    Utils.sort(data.elts, data.currentSort);
  }

  function _ctrlToggle(elt, data){
    if(elt && data.selectedElt && elt.id === data.selectedElt.id){
      data.selectedElt = null;
    } else {
      data.selectedElt = elt;
    }
    data.form = null;
  }

  function _ctrlCreate(data){
    data.form = angular.copy(data.defaultFormElt);
  }

  function _ctrlEdit(elt, data){
    data.form = angular.copy(elt);
  }

  function _ctrlCancelEdit(data){
    data.form = null;
  }

  function _ctrlSave(_elt, CrudSrv, data, title){
    data.status.saving = true;
    var elt = _elt ? _elt : data.form;
    return CrudSrv.save(elt).then(function(elt){
      CollectionUtils.upsertElt(data.elts, elt);
      if(data.currentSort){Utils.sort(data.elts, data.currentSort);}
      if(data.header){ data.header.title = title+' ('+data.elts.length+')'; }
      data.selectedElt = elt;
      data.form = null;
      data.status.loading = false;
      data.status.saving = false;
    }, function(err){
      console.log('Error', err);
      data.status.saving = false;
    });
  }

  function _ctrlRemove(elt, CrudSrv, data, title){
    if(elt && elt.id && $window.confirm('Supprimer ?')){
      data.status.removing = true;
      return CrudSrv.remove(elt).then(function(){
        CollectionUtils.removeElt(data.elts, elt);
        if(data.header){ data.header.title = title+' ('+data.elts.length+')'; }
        data.selectedElt = null;
        data.form = null;
        data.status.loading = false;
        data.status.removing = false;
      }, function(err){
        console.log('Error', err);
        data.status.removing = false;
      });
    } else {
      return $q.when();
    }
  }

  function _ctrlEltRestUrl(_elt, CrudSrv){
    return _elt && _elt.id ? CrudSrv.getUrl(_elt.id) : CrudSrv.getUrl();
  }

  return service;
});
