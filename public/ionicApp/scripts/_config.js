var Config = (function(){
  'use strict';
  var cfg = {
    appVersion: '1.1.0',
    verbose: false,
    debug: false,
    track: false
  };
  var localBackendUrl = 'http://localhost:9000';
  var devBackendUrl = 'http://dev-cookers.herokuapp.com';
  var prodBackendUrl = 'http://cookers.herokuapp.com';
  cfg.backendUrl = localBackendUrl;//cfg.debug ? devBackendUrl : prodBackendUrl;

  return cfg;
})();
