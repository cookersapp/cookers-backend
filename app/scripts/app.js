angular.module('firebaseAdminApp', ['ui.router', 'ngStorage'])

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
  .state('app.product', {
    url: '/product',
    templateUrl: 'views/product.html',
    controller: 'ProductCtrl'
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
    controller: 'CourseCtrl'
  })
  .state('app.course.create', {
    url: '/create',
    templateUrl: 'views/courseForm.html',
    controller: 'CourseCtrl'
  })
  .state('app.course.detail', {
    url: '/:id',
    templateUrl: 'views/courseDetail.html',
    controller: 'CourseCtrl'
  })
  .state('app.course.edit', {
    url: '/:id/edit',
    templateUrl: 'views/courseForm.html',
    controller: 'CourseCtrl'
  })
  .state('app.meal', {
    url: '/meal',
    templateUrl: 'views/meal.html',
    controller: 'MealCtrl'
  })
  .state('app.planning', {
    url: '/planning',
    templateUrl: 'views/planning.html',
    controller: 'PlanningCtrl'
  })
  .state('app.batch', {
    url: '/batch',
    templateUrl: 'views/batch.html',
    controller: 'BatchCtrl'
  });
})

.constant('firebaseUrl', 'https://crackling-fire-7710.firebaseio.com')

.constant('dataList', {
  foodCategories:   ['Viandes & Poissons', 'Fruits & Légumes', 'Pains & Pâtisseries', 'Frais', 'Surgelés', 'Épicerie salée', 'Épicerie sucrée', 'Boissons', 'Bébé', 'Bio', 'Hygiène & Beauté', 'Entretien & Nettoyage', 'Animalerie', 'Bazar & Textile'],
  courseCategories: ['Plat principal', 'Entrée', 'Dessert', 'Vin'],
  currencies:       ['€'],
  servingUnits:     ['personnes'],
  timeUnits:        ['minutes', 'secondes'],
  quantityUnits:    ['g', 'kg', 'cl', 'litre', 'pièce'],
  foodRoles:        ['essentiel', 'secondaire', 'accompagnement', 'facultatif'],
  days:             ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
})

.constant('unitConversion', [
  {ref: 'g', convert: [
    {unit: 'g', factor: 1},
    {unit: 'kg', factor: 1000}
  ]},
  {ref: 'ml', convert: [
    {unit: 'cl', factor: 10},
    {unit: 'litre', factor: 1000}
  ]}
])

.run(function($rootScope, $location, Utils){
  'use strict';
  $rootScope.isActive = function(viewLocation){
    var regex = new RegExp('^'+viewLocation+'$', 'g');
    return regex.test($location.path());
  };
  
  $rootScope.isUrl = Utils.isUrl;

  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest'){
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});