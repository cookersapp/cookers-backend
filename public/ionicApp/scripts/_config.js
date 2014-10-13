var Config = (function(){
  'use strict';
  var cfg = {
    appVersion: '1.1.0',
    verbose: false,
    debug: false,
    storage: false,
    defaultEmail: 'backend@cookers.io',
    track: false
  };
  var localBackendUrl = 'http://localhost:9000';
  var devBackendUrl = 'http://dev-cookers.herokuapp.com';
  var prodBackendUrl = 'http://cookers.herokuapp.com';
  cfg.backendUrl = cfg.debug ? devBackendUrl : prodBackendUrl;

  return cfg;
})();
