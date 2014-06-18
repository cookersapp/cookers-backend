angular.module('firebaseAdminApp', ['ui.router', 'ngStorage', 'firebase'])

.config(function($stateProvider, $urlRouterProvider){
  'use strict';
  $urlRouterProvider.otherwise('/home');

  $stateProvider
  .state('app', {
    url: '',
    abstract: true,
    templateUrl: 'views/root.html',
    controller: 'AppCtrl'
  })
  .state('app.home', {
    url: '/home',
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  })
  .state('app.food', {
    url: '/food',
    templateUrl: 'views/food.html',
    controller: 'FoodCtrl'
  })
  .state('app.course', {
    url: '/course',
    abstract: true,
    template: '<ui-view></ui-view>',
    controller: 'CourseCtrl'
  })
  .state('app.course.list', {
    url: '/list',
    templateUrl: 'views/courseList.html',
    controller: 'CourseListCtrl'
  })
  .state('app.course.create', {
    url: '/create',
    templateUrl: 'views/courseCreate.html',
    controller: 'CourseCreateCtrl'
  });
})

.constant('firebaseUrl', 'https://crackling-fire-7710.firebaseio.com')
.constant('foodConst', {
  categories: ['Viandes & Poissons', 'Fruits & Légumes', 'Pains & Pâtisseries', 'Frais', 'Surgelés', 'Épicerie salée', 'Épicerie sucrée', 'Boissons', 'Bébé', 'Bio', 'Hygiène & Beauté', 'Entretien & Nettoyage', 'Animalerie', 'Bazar & Textile'],
  units: ['litre', 'kg'],
  currencies: ['€']
})
.constant('recipeConst', {
  categories: ['Plat principal', 'Entrée', 'Dessert', 'Vin']
})

.run(function($rootScope, $location){
  $rootScope.isActive = function (viewLocation) {
    var regex = new RegExp('^'+viewLocation+'$', 'g');
    return regex.test($location.path());
  };

  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});