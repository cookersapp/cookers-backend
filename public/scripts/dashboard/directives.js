angular.module('app')


.directive('chart', function(){
  'use strict';
  // doc : http://api.highcharts.com/highcharts
  function loadGraph(element, data, type, title){
    var xAxis;
    if(data){
      if(Array.isArray(data.xAxis)){ xAxis = {categories: data.xAxis}; }
      else if(typeof data.xAxis === 'function'){ xAxis = { labels: { formatter: data.xAxis } }; }
    } 

    var params = {
      chart: { type: type },
      title: { text: title },
      xAxis: xAxis,
      yAxis: {
        title: { text: '' },
        min: 0
      },
      tooltip: data && data.tooltip ? data.tooltip : {},
      plotOptions: {
        bar: {
          dataLabels: { enabled: true }
        }
      },
      legend: data && data.legend ? {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 1
      } : {enabled: false},
      credits: { enabled: false },
      series: data && data.series ? data.series : []
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
      data: '=',
      type: '@',
      title: '@'
    },
    link: function(scope, element, attr){
      element[0].style.height = '100%';

      if(isPromise(scope.data)){
        scope.data.then(function(data){
          loadGraph(element, data, scope.type, scope.title);
        });
      } else {
        loadGraph(element, scope.data, scope.type, scope.title);
      }
    }
  };
})


.directive('user', function(CacheSrv){
  'use strict';
  return {
    restrict: 'E',
    template: '<span>{{username}}</span>',
    scope: {
      id: '='
    },
    link: function(scope, element, attr){
      scope.username = scope.id;
      CacheSrv.getUser(scope.id).then(function(user){
        scope.username = user.email;
      });
    }
  };
})


.directive('eventData', function(CacheSrv){
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
          CacheSrv.getRecipe(scope.showData.recipe).then(function(recipe){
            scope.showData.recipe = recipe.name;
          });
        }
        if(scope.showData.item){
          CacheSrv.getFood(scope.showData.item).then(function(food){
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
