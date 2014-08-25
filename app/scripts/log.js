'use strict';

var Logger = (function(){
  function createUuid(){
    function S4(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

  var config = {
    debug: false,
    currentEventId: null
  };

  function identify(id){
    if(config.debug){
      console.log('$[identify]', id);
    } else {
      var event = {
        id: createUuid(),
        action: 'identify',
        data: id
      };
      sendEvent(event);
    }
  }

  function setProfile(profile){
    if(config.debug){
      console.log('$[register]', profile);
    } else {
      var event = {
        id: createUuid(),
        action: 'register',
        data: profile
      };
      sendEvent(event);
    }
  }

  function track(type, data){
    if(!data){data = {};}
    if(!data.url && window && window.location){data.url = window.location.href;}
    if(!data.time){data.time = Date.now()/1000;} // special mixpanel property
    if(!data.localtime){data.localtime = Date.now();}
    if(!data.eventId){data.eventId = createUuid();}
    if(!data.previousEventId){data.previousEventId = config.currentEventId;}
    config.currentEventId = data.eventId;

    if(config.debug){
      console.log('$[track] '+type, data);
      if(type === 'exception'){window.alert('Error: '+data.message+'\nPlease contact: loicknuchel@gmail.com :(');}
    } else {
      var event = {
        id: createUuid(),
        action: 'track',
        type: type,
        data: data
      };
      sendEvent(event);
    }
  }

  function sendEvent(event, callback){
    if(event.action === 'identify'){
      console.log('$[identify]', event.data);
      /*mixpanel.identify(event.data);*/
    } else if(event.action === 'register'){
      console.log('$[register]', event.data);
      /*mixpanel.people.set(event.data, function(success, data){
        if(callback){callback(event, success ? 'ok' : 'ko');}
      });*/
    } else if(event.action === 'track'){
      console.log('$[track] '+event.type, event.data);
      /*mixpanel.track(event.type, event.data, function(success, data){
        if(callback){callback(event, success ? 'ok' : 'ko');}
      });*/
      if(event.type === 'exception'){window.alert('Error: '+event.data.message+'\nPlease contact: loicknuchel@gmail.com :(');}
    } else {
      if(callback){callback(event, 'unknown');}
    }
  }

  return {
    debug: config.debug,
    setDebug: function(d){ config.debug = d; },
    identify: identify,
    setProfile: setProfile,
    track: track
  };
})();


// catch exceptions
window.onerror = function(message, url, line, col, error){
  var stopPropagation = Logger.debug ? false : true;
  var data = {
    type: 'javascript'
  };
  if(message)       { data.message      = message;      }
  if(url)           { data.fileName     = url;          }
  if(line)          { data.lineNumber   = line;         }
  if(col)           { data.columnNumber = col;          }
  if(error){
    if(error.name)  { data.name         = error.name;   }
    if(error.stack) { data.stack        = error.stack;  }
  }
  if(navigator){
    if(navigator.userAgent)   { data['navigator.userAgent']     = navigator.userAgent;    }
    if(navigator.platform)    { data['navigator.platform']      = navigator.platform;     }
    if(navigator.vendor)      { data['navigator.vendor']        = navigator.vendor;       }
    if(navigator.appCodeName) { data['navigator.appCodeName']   = navigator.appCodeName;  }
    if(navigator.appName)     { data['navigator.appName']       = navigator.appName;      }
    if(navigator.appVersion)  { data['navigator.appVersion']    = navigator.appVersion;   }
    if(navigator.product)     { data['navigator.product']       = navigator.product;      }
  }

  Logger.track('exception', data);
  return stopPropagation;
};
