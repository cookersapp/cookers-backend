angular.module('app')

.factory('GlobalmessageSrv', function(CrudUtils){
  'use strict';
  var baseUrl = '/api/v1/globalmessages';
  var processBreforeSave = function(elt){
    if(elt){
      elt.sticky = !!elt.sticky;
    }
  };

  return CrudUtils.createCrud(baseUrl, processBreforeSave);
})

.factory('StoresSrv', function(CrudUtils){
  'use strict';
  var baseUrl = '/api/v1/stores';
  var processBreforeSave = function(elt){};

  return CrudUtils.createCrud(baseUrl, processBreforeSave);
})

.factory('StoreProductsSrv', function(CrudUtils){
  'use strict';
  var service = {
    create: create
  };

  function create(storeId){
    var baseUrl = '/api/v1/stores/'+storeId+'/products';
    var processBreforeSave = function(elt){
      if(elt){
        if(Array.isArray(elt.promos)){
          for(var i in elt.promos){
            elt.promos[i].id = elt.promos[i].product;
          }
        }
        if(Array.isArray(elt.recommandations)){
          for(var i in elt.recommandations){
            elt.recommandations[i].id = elt.recommandations[i].category+'~'+elt.recommandations[i].reference;
          }
        }
      }
    };
    return CrudUtils.createCrud(baseUrl, processBreforeSave);
  }

  return service;
});
