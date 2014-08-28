'use strict';

angular.module('app')

.factory('CrudBuilder', function($q, Utils){
  var service = {
    create: createCrud,
    removeElt: _removeElt,
    moveEltDown: _moveEltDown,
    eltExistsIn: _eltExistsIn
  };

  function createCrud(DataSrv, ctx){
    return {
      init:         function()                { _init(DataSrv, ctx);                },
      sort:         function(order, desc)     { _sort(ctx, order, desc);            }, // sort ctx.model.elts according to parameters 'order' and 'desc'
      toggle:       function(elt)             { _toggle(ctx, elt);                  }, // select/unselect an elt in ctx.model.elts
      create:       function()                { _create(ctx);                       },
      edit:         function(elt)             { _edit(ctx, elt);                    },
      cancelEdit:   function()                { _cancelEdit(ctx);                   },
      save:         function(elt)             { return _save(DataSrv, ctx, elt);    }, // elt is optional, ctx.model.form is taken if not provided
      remove:       function(elt)             { return _remove(DataSrv, ctx, elt);  },
      addElt:       function(obj, attr, elt)  { _addElt(ctx, obj, attr, elt);       },
      removeElt:    function(arr, index)      { _removeElt(arr, index);             },
      moveEltDown:  function(arr, index)      { _moveEltDown(arr, index);           },
      eltExistsIn:  function(arr, elt)        { return _eltExistsIn(arr, elt);      },
      eltRestUrl:   function(elt)             { return _eltRestUrl(DataSrv, elt);   }
    };
  }


  function _init(DataSrv, ctx){
    if(ctx.config.sort){Utils.sort(ctx.model.elts, ctx.config.sort);}
    ctx.header.title = ctx.title+' ('+ctx.model.elts.length+')';
    _loadData(DataSrv, ctx);
  }

  function _sort(ctx, order, desc){
    if(ctx.config.sort){
      var sort = ctx.config.sort;
      if(sort.order === order){
        sort.desc = !sort.desc;
      } else {
        sort.order = order;
        sort.desc = desc ? desc : false;
      }
      Utils.sort(ctx.model.elts, sort);
    } else {
      Utils.sort(ctx.model.elts, {order: order, desc: desc});
    }
  }

  function _toggle(ctx, elt){
    if(elt && ctx.model.selected && ctx.model.selected.id === elt.id){
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
  function _save(DataSrv, ctx, elt){
    ctx.status.saving = true;
    var elt = DataSrv.process(elt ? elt : ctx.model.form, ctx.data.process ? ctx.data.process : null);
    var eltId = elt.id;
    return DataSrv.save(elt).then(function(){
      return DataSrv.get(eltId).then(function(elt){
        _.remove(ctx.model.elts, {id: eltId});
        ctx.model.elts.push(elt);
        if(ctx.config.sort){Utils.sort(ctx.model.elts, ctx.config.sort);}
        ctx.header.title = ctx.title+' ('+ctx.model.elts.length+')';
        ctx.model.selected = elt;
        ctx.model.form = null;
        ctx.status.loading = false;
        ctx.status.saving = false;
      });
    }, function(err){
      console.log('Error', err);
      ctx.status.saving = false;
    });
  }
  function _remove(DataSrv, ctx, elt){
    if(elt && elt.id && window.confirm('Supprimer ?')){
      ctx.status.removing = true;
      var eltId = elt.id;
      return DataSrv.remove(elt).then(function(){
        _.remove(ctx.model.elts, {id: eltId});
        ctx.model.selected = null;
        ctx.status.removing = false;
      }, function(err){
        console.log('Error', err);
        ctx.status.removing = false;
      });
    } else {
      return $q.when();
    }
  }

  function _addElt(ctx, obj, attr, elt){
    if(obj && typeof obj === 'object'){
      if(!Array.isArray(obj[attr])){ obj[attr] = []; }

      if(elt){elt = angular.copy(elt);}
      else if(ctx.config && ctx.config.defaultValues && ctx.config.defaultValues[attr]){ elt = angular.copy(ctx.config.defaultValues[attr]); }
      else {elt = {};}

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

  function _eltRestUrl(DataSrv, elt){
    return elt && elt.id ? DataSrv.getUrl(elt.id) : DataSrv.getUrl();
  }

  function _loadData(DataSrv, ctx){
    return DataSrv.getAll().then(function(elts){
      ctx.header.title = ctx.title+' ('+elts.length+')';
      if(ctx.config.sort){Utils.sort(elts, ctx.config.sort);}
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
