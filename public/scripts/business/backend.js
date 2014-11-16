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
});
