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
  .state('app.recipe', {
    url: '/recipe',
    abstract: true,
    template: '<ui-view></ui-view>',
    controller: 'RecipeCtrl'
  })
  .state('app.recipe.list', {
    url: '/list',
    templateUrl: 'views/recipeList.html',
    controller: 'RecipeCtrl'
  })
  .state('app.recipe.create', {
    url: '/create',
    templateUrl: 'views/recipeForm.html',
    controller: 'RecipeCtrl'
  })
  .state('app.recipe.detail', {
    url: '/:id',
    templateUrl: 'views/recipeDetail.html',
    controller: 'RecipeCtrl'
  })
  .state('app.recipe.edit', {
    url: '/:id/edit',
    templateUrl: 'views/recipeForm.html',
    controller: 'RecipeCtrl'
  })
  .state('app.meal', {
    url: '/meal',
    templateUrl: 'views/meal.html',
    controller: 'MealCtrl'
  })
  .state('app.weekrecipes', {
    url: '/weekrecipes',
    templateUrl: 'views/weekrecipes.html',
    controller: 'WeekrecipesCtrl'
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
  recipeCategories: ['Plat principal', 'Entrée', 'Dessert', 'Vin'],
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