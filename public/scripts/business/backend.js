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
      if(elt && elt.promo && elt.promo.product){
        elt.promo.id = elt.promo.product;
      }
    };
    return CrudUtils.createCrud(baseUrl, processBreforeSave);
  }

  return service;
});
