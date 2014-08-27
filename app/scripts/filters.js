'use strict';

angular.module('app')

.filter('date', function(){
  return function(timestamp, format){
    return timestamp ? moment(timestamp).format(format ? format : 'll') : '<date>';
  };
})

.filter('week', function(){
  return function(week, format){
    var f = format ? format : 'll';
    return week ? moment().week(week).day(1).format(f)+' - '+moment().week(week).day(7).format(f) : '<week>';
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
  'use strict';
  return function(number, round){
    var mul = Math.pow(10, round ? round : 0);
    return $filter('number')(Math.round(number*mul)/mul);
  };
})

.filter('unit', function(){
  'use strict';
  return function(unit){
    if(unit === 'piece' || unit === 'pièce'){
      return '';
    } else {
      return unit;
    }
  };
})

.filter('cookTime', function($filter){
  'use strict';
  return function(time){
    return time && time.eat > 0 ? $filter('mynumber')(time.eat, 2)+' '+$filter('unit')(time.unit) : '';
  };
})

.filter('servings', function($filter){
  'use strict';
  return function(servings, servingsAdjust){
    if(!servingsAdjust){servingsAdjust = 1;}
    return servings && servings.value > 0 ? $filter('mynumber')(servings.value*servingsAdjust, 2)+' '+$filter('unit')(servings.unit) : '';
  };
})

.filter('price', function($filter){
  'use strict';
  return function(price, showUnit, priceAdjust){
    if(price){
      if(showUnit === undefined){showUnit = true;}
      if(priceAdjust === undefined){priceAdjust = 1;}
      return $filter('mynumber')(price.value*priceAdjust, 2) + ' ' + price.currency + (showUnit && price.unit ? '/' + price.unit : '');
    } else {
      return '<price>';
    }
  };
})

.filter('quantity', function($filter){
  'use strict';
  return function(quantity, servingsAdjust){
    if(!servingsAdjust){servingsAdjust = 1;}
    return quantity && quantity.value > 0 ? $filter('mynumber')(quantity.value*servingsAdjust, 2)+' '+$filter('unit')(quantity.unit) : '';
  };
})

.filter('tool', function(){
  'use strict';
  return function(tool){
    return tool && tool.name ? tool.name : '';
  };
})

.filter('ingredient', function($filter){
  'use strict';
  function endsWith(str, suffix){
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function preWords(ingredient){
    if(ingredient && ingredient.pre){
      return ' ' + ingredient.pre + (endsWith(ingredient.pre, '\'') ? '' : ' ');
    } else {
      return ' ';
    }
  }

  function postWords(ingredient){
    if(ingredient && ingredient.post){
      return ' ' + ingredient.post;
    } else {
      return '';
    }
  }

  return function(ingredient, servingsAdjust){
    if(ingredient){
      return $filter('quantity')(ingredient.quantity, servingsAdjust) + preWords(ingredient) + ingredient.food.name + postWords(ingredient);
    } else {
      return '';
    }
  };
});
