angular.module('firebaseAdminApp', ['ui.router', 'visor', 'ngCookies', 'ngStorage', 'leaflet-directive'])

.config(function($stateProvider, $urlRouterProvider, visorProvider, authenticatedOnly){
  'use strict';
  visorProvider.authenticate = ['$cookieStore', '$q', '$rootScope', function($cookieStore, $q, $rootScope){
    var user = $cookieStore.get('user');
    if(user){
      $rootScope.user = user;
      return $q.when(user);
    } else {
      return $q.reject(null);
    }
  }];
  visorProvider.doOnNotAuthorized = ['$state', 'restrictedUrl', function($state, restrictedUrl){
    $state.go('app.access_denied', {prevUrl: restrictedUrl});
  }];

  $stateProvider
  .state('app', {
    url: '',
    abstract: true,
    templateUrl: 'views/root.html',
    controller: 'EmptyCtrl'
  })
  .state('app.home', {
    url: '/home',
    templateUrl: 'views/home.html',
    controller: 'EmptyCtrl'
  })
  .state('app.food', {
    url: '/food',
    templateUrl: 'views/data/food.html',
    controller: 'FoodCtrl',
    restrict: authenticatedOnly
  })
  .state('app.product', {
    url: '/product',
    templateUrl: 'views/data/product.html',
    controller: 'ProductCtrl',
    restrict: authenticatedOnly
  })
  .state('app.recipe', {
    url: '/recipe',
    abstract: true,
    template: '<ui-view></ui-view>',
    controller: 'EmptyCtrl',
    restrict: authenticatedOnly
  })
  .state('app.recipe.list', {
    url: '/list',
    templateUrl: 'views/data/recipeList.html',
    controller: 'RecipeCtrl',
    restrict: authenticatedOnly
  })
  .state('app.recipe.create', {
    url: '/create',
    templateUrl: 'views/data/recipeForm.html',
    controller: 'RecipeCtrl',
    restrict: authenticatedOnly
  })
  .state('app.recipe.detail', {
    url: '/:id',
    templateUrl: 'views/data/recipeDetail.html',
    controller: 'RecipeCtrl',
    restrict: authenticatedOnly
  })
  .state('app.recipe.edit', {
    url: '/:id/edit',
    templateUrl: 'views/data/recipeForm.html',
    controller: 'RecipeCtrl',
    restrict: authenticatedOnly
  })
  .state('app.meal', {
    url: '/meal',
    templateUrl: 'views/data/meal.html',
    controller: 'MealCtrl',
    restrict: authenticatedOnly
  })
  .state('app.weekrecipes', {
    url: '/weekrecipes',
    templateUrl: 'views/data/weekrecipes.html',
    controller: 'WeekrecipesCtrl',
    restrict: authenticatedOnly
  })
  .state('app.planning', {
    url: '/planning',
    templateUrl: 'views/data/planning.html',
    controller: 'PlanningCtrl',
    restrict: authenticatedOnly
  })
  .state('app.users', {
    url: '/users',
    templateUrl: 'views/users.html',
    controller: 'UsersCtrl',
    restrict: authenticatedOnly
  })
  .state('app.userinfos', {
    url: '/userinfos',
    templateUrl: 'views/userinfos.html',
    controller: 'UserinfosCtrl',
    restrict: authenticatedOnly
  })
  .state('app.purchases', {
    url: '/purchases',
    templateUrl: 'views/purchases.html',
    controller: 'PurchasesCtrl',
    restrict: authenticatedOnly
  })
  .state('app.batch', {
    url: '/batch',
    templateUrl: 'views/batch.html',
    controller: 'BatchCtrl',
    restrict: authenticatedOnly
  })

  .state('app.login', {
    url: '/login',
    templateUrl: 'views/auth/login.html',
    controller: 'LoginCtrl',
    restrict: function(user){ return user === undefined; }
  })
  .state('app.access_denied', {
    url:'/access_denied?prevUrl',
    templateUrl: 'views/auth/access_denied.html',
    controller: 'AccessDeniedCtrl'
  });

  $urlRouterProvider.otherwise('/home');
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

.run(function($rootScope, $state, $location, $cookieStore, visor, firebaseUrl, Utils){
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

  // auth
  var firebaseRef = new Firebase(firebaseUrl);
  $rootScope.auth = new FirebaseSimpleLogin(firebaseRef, function(error, user){
    if(error){
      $rootScope.safeApply(function(){
        $rootScope.loginError = error.message.replace('FirebaseSimpleLogin: ', '');
      });
    } else if(user){
      $cookieStore.put('user', user);
      $rootScope.user = user;
      visor.setAuthenticated(user);
    } else {
      $cookieStore.remove('user');
      $rootScope.user = undefined;
      visor.setUnauthenticated();
      $state.go('app.home');
    }
  });

  $rootScope.logout = function(){
    $rootScope.auth.logout();
  };

  $rootScope.isLogged = function(){
    return !!$rootScope.user;
  };
});