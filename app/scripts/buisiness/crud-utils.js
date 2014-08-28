'use strict';

angular.module('app')

.factory('CrudBuilder', function($q, Utils){
  var service = {
    create: createCrud,
    removeElt: _removeElt,
    moveEltDown: _moveEltDown,
    eltExistsIn: _eltExistsIn
  };

  function createCrud(DataSrv, ctx, _lazy){
    // parameters starting with _ are optionnals
    return {
      init:         function()                { _init(DataSrv, ctx, _lazy);                     },
      initForElt:   function(id, _edit)       { _initForElt(DataSrv, ctx, id, _edit);           },
      sort:         function(order, _desc)    { _sort(ctx, order, _desc);                       }, // sort ctx.model.elts according to parameters 'order' and 'desc'
      toggle:       function(elt)             { _toggle(DataSrv, ctx, _lazy, elt);              }, // select/unselect an elt in ctx.model.elts
      create:       function()                { _create(ctx);                                   },
      edit:         function(elt)             { _edit(ctx, elt);                                },
      cancelEdit:   function()                { _cancelEdit(ctx);                               },
      save:         function(_elt, _addedCb)  { return _save(DataSrv, ctx, _elt, _addedCb);     }, // elt is optional, ctx.model.form is taken if not provided
      remove:       function(elt, _removedCb) { return _remove(DataSrv, ctx, elt, _removedCb);  },
      addElt:       function(obj, attr, _elt) { _addElt(ctx, obj, attr, _elt);                  },
      removeElt:    function(arr, index)      { _removeElt(arr, index);                         },
      moveEltDown:  function(arr, index)      { _moveEltDown(arr, index);                       },
      eltExistsIn:  function(arr, elt)        { return _eltExistsIn(arr, elt);                  },
      eltRestUrl:   function(_elt)            { return _eltRestUrl(DataSrv, _elt);              }
    };
  }


  function _init(DataSrv, ctx, _lazy){
    if(ctx.header){
      if(ctx.title){ctx.header.title = ctx.title+' ('+ctx.model.elts.length+')';}
      if(ctx.breadcrumb){ctx.header.levels = ctx.breadcrumb;}
    }
    if(ctx.config && ctx.config.sort){Utils.sort(ctx.model.elts, ctx.config.sort);}
    _loadData(DataSrv, ctx, _lazy);
  }

  function _initForElt(DataSrv, ctx, id, _edit){
    if(id){
      DataSrv.get(id).then(function(elt){
        _loadElt(ctx, elt, _edit);
      }, function(err){
        console.warn('can\'t load '+ctx.title+' <'+id+'>', err);
        ctx.status.loading = false;
        ctx.status.error = err.statusText ? err.statusText : 'Unable to load '+ctx.title+' <'+id+'> :(';
      });
    } else if(ctx.config && ctx.config.defaultValues && ctx.config.defaultValues.elt){
      _loadElt(ctx, ctx.config.defaultValues.elt, _edit);
    } else {
      _loadElt(ctx, {}, _edit);
    }
  }

  function _loadElt(ctx, elt, _edit){
    if(ctx.header){
      ctx.header.title = elt.name ? elt.name : ctx.title;
      if(ctx.breadcrumb){ctx.header.levels = ctx.breadcrumb;}
      if(_edit && elt.id && ctx.eltState){ ctx.header.levels.splice(ctx.header.levels.length-1, 0, {name: elt.name, state: ctx.eltState(elt)}); }
      else if(!_edit && elt.name && ctx.header.levels.length > 0){ ctx.header.levels[ctx.header.levels.length-1].name = elt.name; }
    }

    if(_edit){
      ctx.model.form = angular.copy(elt);
      if(ctx.config && ctx.config.defaultValues && ctx.config.defaultValues.elt){ Utils.extendsWith(ctx.model.form, ctx.config.defaultValues.elt); }
    }
    ctx.model.selected = elt;
    ctx.status.loading = false;
  }

  function _sort(ctx, order, _desc){
    if(ctx.config.sort){
      var sort = ctx.config.sort;
      if(sort.order === order){
        sort.desc = !sort.desc;
      } else {
        sort.order = order;
        sort.desc = _desc ? _desc : false;
      }
      Utils.sort(ctx.model.elts, sort);
    } else {
      Utils.sort(ctx.model.elts, {order: order, desc: _desc});
    }
  }

  function _toggle(DataSrv, ctx, _lazy, elt){
    if(_lazy && !elt.lazyLoaded){ DataSrv.fullLoad(elt); }
    if(elt && ctx.model.selected && elt.id === ctx.model.selected.id){
      ctx.model.selected = null;
    } else {
      ctx.model.selected = elt;
    }
    ctx.model.form = null;
  }

  function _create(ctx){
    if(ctx.config && ctx.config.defaultValues && ctx.config.defaultValues.elt){ ctx.model.form = angular.copy(ctx.config.defaultValues.elt); }
    else { ctx.model.form = {}; }
  }
  function _edit(ctx, elt){
    ctx.model.form = angular.copy(elt);
  }
  function _cancelEdit(ctx){
    ctx.model.form = null;
  }
  function _save(DataSrv, ctx, _elt, _addedCb){
    ctx.status.saving = true;
    var elt = DataSrv.process(_elt ? _elt : ctx.model.form, ctx.data.process ? ctx.data.process : null);
    var eltId = elt.id;
    return DataSrv.save(elt).then(function(){
      if(_addedCb){
        _addedCb(elt);
      } else {
        return DataSrv.get(eltId).then(function(elt){
          if(ctx.config.sort){Utils.sort(ctx.model.elts, ctx.config.sort);}
          ctx.header.title = ctx.title+' ('+ctx.model.elts.length+')';
          ctx.model.selected = elt;
          ctx.model.form = null;
          ctx.status.loading = false;
          ctx.status.saving = false;
        });
      }
    }, function(err){
      console.log('Error', err);
      ctx.status.saving = false;
    });
  }
  function _remove(DataSrv, ctx, elt, _removedCb){
    if(elt && elt.id && window.confirm('Supprimer ?')){
      ctx.status.removing = true;
      var eltId = elt.id;
      return DataSrv.remove(elt).then(function(){
        if(_removedCb){
          _removedCb(elt);
        } else {
          _.remove(ctx.model.elts, {id: eltId});
          ctx.header.title = ctx.title+' ('+ctx.model.elts.length+')';
          ctx.model.selected = null;
          ctx.model.form = null;
          ctx.status.loading = false;
          ctx.status.removing = false;
        }
      }, function(err){
        console.log('Error', err);
        ctx.status.removing = false;
      });
    } else {
      return $q.when();
    }
  }

  function _addElt(ctx, obj, attr, _elt){
    if(obj && typeof obj === 'object'){
      if(!Array.isArray(obj[attr])){ obj[attr] = []; }

      var elt = {};
      if(_elt){elt = angular.copy(_elt);}
      else if(ctx.config && ctx.config.defaultValues && ctx.config.defaultValues[attr]){ elt = angular.copy(ctx.config.defaultValues[attr]); }

      obj[attr].push(elt);
    } else {
      console.warn('Unable to addElt to', obj);
    }
  }
  function _removeElt(arr, index){
    if(Array.isArray(arr) && index < arr.length){ arr.splice(index, 1); }
    else { console.warn('Unable to removeElt <'+index+'> from', arr); }
  }
  function _moveEltDown(arr, index){
    if(Array.isArray(arr) && index < arr.length-1){
      var elt = arr.splice(index, 1)[0];
      arr.splice(index+1, 0, elt);
    }
  }
  function _eltExistsIn(arr, elt){
    if(elt && elt.id && Array.isArray(arr)){
      return _.find(arr, {id: elt.id}) !== undefined;
    } else {
      return false;
    }
  }

  function _eltRestUrl(DataSrv, _elt){
    return _elt && _elt.id ? DataSrv.getUrl(_elt.id) : DataSrv.getUrl();
  }

  function _loadData(DataSrv, ctx, _lazy){
    return DataSrv.getAll(_lazy).then(function(elts){
      if(ctx.header){ctx.header.title = ctx.title+' ('+elts.length+')';}
      if(ctx.config && ctx.config.sort){Utils.sort(elts, ctx.config.sort);}
      ctx.model.elts = elts;
      ctx.status.loading = false;
    }, function(err){
      console.warn('can\'t load '+ctx.title, err);
      ctx.status.loading = false;
      ctx.status.error = err.statusText ? err.statusText : 'Unable to load '+ctx.title+' :(';
    });
  }

  return service;
});
