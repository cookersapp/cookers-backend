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
        if(elt.promo && elt.promo.product){
          elt.promo.id = elt.promo.product;
        }
        if(elt.recommandation){
          elt.recommandation.id = elt.recommandation.category+'~'+elt.recommandation.reference;
        }
      }
    };
    return CrudUtils.createCrud(baseUrl, processBreforeSave);
  }

  return service;
});
