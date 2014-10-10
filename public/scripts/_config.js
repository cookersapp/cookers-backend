var Config = (function(){
  'use strict';
  var cfg = {
    env: ENV,
    debug: ENV !== 'prod'
  };
  return cfg;
})();
