angular.module('app')


.directive('chart', function(){
  'use strict';
  // doc : http://api.highcharts.com/highcharts
  /*
   * Options values :
   * {
   *  type: String (values: 'line', 'area', bar'),
   *  subtype: String (values: 'stacked'),
   *  title: String (chart title),
   *  xAxis: String (values: 'datetime') | Array (names in xAxis) | function (transform index in label),
   *  tooltip: Object (http://api.highcharts.com/highcharts#tooltip),
   *  legend: String (values: 'top', 'right', 'bottom', 'left'),
   *  series: Array (http://api.highcharts.com/highcharts#series)
   * }
   */
  function loadGraph(element, opts){
    var xAxis;
    if(opts){
      if(Array.isArray(opts.xAxis)){ xAxis = {categories: opts.xAxis}; }
      else if(typeof opts.xAxis === 'string'){ xAxis = { type: opts.xAxis }; }
      else if(typeof opts.xAxis === 'function'){ xAxis = { labels: { formatter: opts.xAxis } }; }
    } 

    var params = {
      chart: { type: opts ? opts.type : '' },
      title: { text: opts ? opts.title : '' },
      colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
      xAxis: xAxis,
      yAxis: {
        title: { text: '' }
      },
      tooltip: opts && opts.tooltip ? opts.tooltip : {},
      plotOptions: {
        area: {
          stacking: opts && opts.subtype === 'stacked' ? 'normal' : null
        },
        bar: {
          dataLabels: { enabled: true }
        }
      },
      legend: opts && opts.legend ? {
        layout: opts.legend === 'bottom' || opts.legend === 'top' ? 'horizontal' : 'vertical',
        align: opts.legend === 'bottom' || opts.legend === 'top' ? 'center' : opts.legend,
        verticalAlign: opts.legend === 'bottom' || opts.legend === 'top' ? opts.legend : 'middle',
        borderWidth: 1
      } : {enabled: false},
      credits: { enabled: false },
      series: opts && opts.series ? opts.series : []
    };
    element.highcharts(params);
  }

  function isPromise(p){
    return p && p.then;
  }

  return {
    restrict: 'A',
    template: '',
    scope: {
      opts: '=chart'
    },
    link: function(scope, element, attr){
      element[0].style.height = '100%';

      if(isPromise(scope.opts)){
        scope.opts.then(function(opts){
          loadGraph(element, opts);
        });
      } else {
        loadGraph(element, scope.opts);
      }
    }
  };
})


.directive('lastSeen', function(){
  'use strict';
  return {
    restrict: 'A',
    template: '<span class="{{status}}"><i class="{{icon}}"></i></span> {{lastSeen | humanTime}}',
    scope: {
      lastSeen: '='
    },
    link: function(scope, element, attr){
      var daysAgo = moment().diff(moment(scope.lastSeen), 'days');
      if(daysAgo < 5){
        scope.status = 'text-success';
        scope.icon = 'fa fa-check';
      } else if(daysAgo < 10){
        scope.status = 'text-warning';
        scope.icon = 'fa fa-flash';
      } else {
        scope.status = 'text-danger';
        scope.icon = 'fa fa-warning';
      }
    }
  };
})


.directive('user', function(UsersSrv){
  'use strict';
  return {
    restrict: 'E',
    template: '<span>{{username}}</span>',
    scope: {
      id: '='
    },
    link: function(scope, element, attr){
      scope.username = scope.id;
      UsersSrv.get(scope.id, false).then(function(user){
        if(user){ scope.username = user.email; }
      });
    }
  };
})


.directive('eventData', function(RecipeSrv, FoodSrv){
  'use strict';
  return {
    restrict: 'E',
    template: '<span>{{showData | json}}</span>',
    scope: {
      event: '='
    },
    link: function(scope, element, attr){
      scope.showData = undefined;
      if(scope.event && scope.event.data){
        scope.showData = angular.copy(scope.event.data);
        if(scope.showData.recipe){
          RecipeSrv.get(scope.showData.recipe, false).then(function(recipe){
            scope.showData.recipe = recipe.name;
          });
        }
        if(scope.showData.item){
          FoodSrv.get(scope.showData.item, false).then(function(food){
            scope.showData.item = food.name;
          });
        }
        if(scope.showData.quantity){ scope.showData.quantity = scope.showData.quantity.value + ' ' + scope.showData.quantity.unit; }
        if(scope.showData.customItems){
          scope.showData.customItems = scope.showData.customItems.map(function(item){
            return item.name;
          });
        }
        if(scope.showData.position){
          delete scope.showData.position.speed;
          delete scope.showData.position.heading;
          delete scope.showData.position.altitudeAccuracy;
          delete scope.showData.position.altitude;
          delete scope.showData.position.timestamp;
        }
        if(scope.event.name === 'exception'){
          if(scope.showData.message.length > 100){scope.showData.message = scope.showData.message.slice(0, 97) + '...';}
          delete scope.showData.fileName;
          delete scope.showData.lineNumber;
          delete scope.showData.columnNumber;
          delete scope.showData.name;
          delete scope.showData.stack;
          delete scope.showData.cause;
          delete scope.showData['navigator.userAgent'];
          delete scope.showData['navigator.platform'];
          delete scope.showData['navigator.vendor'];
          delete scope.showData['navigator.appCodeName'];
          delete scope.showData['navigator.appName'];
          delete scope.showData['navigator.appVersion'];
          delete scope.showData['navigator.product'];
        }
      }
    }
  };
});
