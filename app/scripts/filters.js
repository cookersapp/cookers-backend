'use strict';

angular.module('app')

.filter('date', function(){
  return function(timestamp, format){
    return timestamp ? moment(timestamp).format(format ? format : 'LL') : '<date>';
  };
})

.filter('duration', function(){
  return function(seconds, humanize){
    if(seconds || seconds === 0){
      if(humanize){
        return moment.duration(seconds, 'seconds').humanize();
      } else {
        var prefix = -60 < seconds && seconds < 60 ? '00:' : '';
        return prefix + moment.duration(seconds, 'seconds').format('hh:mm:ss');
      }
    } else {
      console.warn('Unable to format duration', seconds);
      return '<duration>';
    }
  };
})

.filter('mynumber', function($filter){
  return function(number, round){
    var mul = Math.pow(10, round ? round : 0);
    return $filter('number')(Math.round(number*mul)/mul);
  };
});
