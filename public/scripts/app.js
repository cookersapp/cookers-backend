angular.module('app', ['ui.router', 'ngCookies', 'firebase', 'ui.bootstrap'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, debug){
  'use strict';
  // catch exceptions in angular
  $provide.decorator('$exceptionHandler', ['$delegate', function($delegate){
    return function(exception, cause){
      $delegate(exception, cause);

      var data = {
        type: 'angular'
      };
      if(cause)               { data.cause    = cause;              }
      if(exception){
        if(exception.message) { data.message  = exception.message;  }
        if(exception.name)    { data.name     = exception.name;     }
        if(exception.stack)   { data.stack    = exception.stack;    }
      }

      Logger.track('exception', data);
    };
  }]);


  var access = routingConfig.accessLevels;

  // Public routes
  $stateProvider
  .state('public', {
    abstract: true,
    template: '<ui-view/>',
    data: {
      access: access.public
    }
  });

  // Anonymous routes
  $stateProvider
  .state('anon', {
    abstract: true,
    template: '<ui-view/>',
    data: {
      access: access.anon
    }
  })
  .state('anon.login', {
    url: '/login',
    templateUrl: 'assets/views/login.html',
    controller: 'LoginCtrl'
  });

  // Regular user routes
  $stateProvider
  .state('user', {
    abstract: true,
    templateUrl: 'assets/views/layout.html',
    controller: 'MainCtrl',
    data: {
      access: access.user
    }
  })
  .state('user.home', {
    url: '/',
    templateUrl: 'assets/views/dashboard/main.html',
    controller: 'DashboardCtrl'
  })
  .state('user.dashboard', {
    url: '/dashboard',
    abstract: true,
    template: '<ui-view/>'
  })
  .state('user.dashboard.users', {
    url: '/users',
    templateUrl: 'assets/views/dashboard/users.html',
    controller: 'DashboardUsersCtrl'
  })
  .state('user.dashboard.user', {
    url: '/users/:userId',
    templateUrl: 'assets/views/dashboard/user.html',
    controller: 'DashboardUserCtrl'
  })
  .state('user.dashboard.events', {
    url: '/events',
    templateUrl: 'assets/views/dashboard/events.html',
    controller: 'DashboardEventsCtrl'
  })
  .state('user.dashboard.exceptions', {
    url: '/exceptions',
    templateUrl: 'assets/views/dashboard/exceptions.html',
    controller: 'DashboardExceptionsCtrl'
  })
  .state('user.dashboard.errors', {
    url: '/errors',
    templateUrl: 'assets/views/dashboard/errors.html',
    controller: 'DashboardErrorsCtrl'
  })
  .state('user.dashboard.malformed', {
    url: '/malformed',
    templateUrl: 'assets/views/dashboard/malformed.html',
    controller: 'DashboardMalformedCtrl'
  })
  .state('user.dashboard.event', {
    url: '/events/:eventId',
    templateUrl: 'assets/views/dashboard/event.html',
    controller: 'DashboardEventCtrl'
  })
  .state('user.dashboard.recipes', {
    url: '/recipes',
    templateUrl: 'assets/views/dashboard/recipes.html',
    controller: 'DashboardRecipesCtrl'
  })
  .state('user.data', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('user.data.recipes', {
    url: '/recipes',
    templateUrl: 'assets/views/data/recipes.html',
    controller: 'RecipesCtrl'
  })
  .state('user.data.recipecreate', {
    url: '/recipes/create',
    templateUrl: 'assets/views/data/recipe-edit.html',
    controller: 'RecipeEditCtrl'
  })
  .state('user.data.recipe', {
    url: '/recipes/:recipeId',
    templateUrl: 'assets/views/data/recipe.html',
    controller: 'RecipeCtrl'
  })
  .state('user.data.recipeedit', {
    url: '/recipes/:recipeId/edit',
    templateUrl: 'assets/views/data/recipe-edit.html',
    controller: 'RecipeEditCtrl'
  })
  .state('user.data.selections', {
    url: '/selections',
    templateUrl: 'assets/views/data/selections.html',
    controller: 'SelectionsCtrl'
  })
  .state('user.data.foods', {
    url: '/foods',
    templateUrl: 'assets/views/data/foods.html',
    controller: 'FoodsCtrl'
  })
  .state('user.admin', {
    abstract: true,
    template: '<ui-view/>'
  })
  .state('user.admin.globalmessages', {
    url: '/globalmessages',
    templateUrl: 'assets/views/admin/globalmessages.html',
    controller: 'GlobalmessagesCtrl'
  })
  .state('user.admin.batchs', {
    url: '/batchs',
    templateUrl: 'assets/views/admin/batchs.html',
    controller: 'BatchsCtrl'
  })
  .state('user.sample1', {
    url: '/sample1',
    templateUrl: 'assets/views/sample1.html',
    controller: 'Sample1Ctrl'
  })
  .state('user.sample2', {
    url: '/sample2',
    templateUrl: 'assets/views/sample2.html'
  });

  $urlRouterProvider.otherwise('/');

  $httpProvider.interceptors.push(['$q', '$location', function($q, $location){
    return {
      'responseError': function(response){
        if(response.status === 401 || response.status === 403){
          $location.path('/login');
        }
        return $q.reject(response);
      }
    };
  }]);
})

.constant('env', Config.env)
.constant('isProd', Config.env === 'prod')
.constant('debug', Config.debug)
.constant('firebaseUrl', 'https://crackling-fire-7710.firebaseio.com')

.constant('dataList', {
  recipeCategories: ['Plat principal', 'Entrée', 'Dessert', 'Vin'],
  servingUnits:     ['personnes'],
  timeUnits:        ['minutes', 'secondes'],
  quantityUnits:    ['pièce', 'g', 'kg', 'cl', 'litre'],
  ingredientRoles:  ['essentiel', 'facultatif', 'assaisonnement', 'accompagnement'],
  instructionTitles:['Allons-y gaiement !', 'C\'est parti !', 'En avant guingamp !', 'Cassons la croûte !'],
  timerColors:      ['blue', 'red', 'yellow', 'green', 'orange'],
  foodCategories:   ['Viandes & Poissons', 'Fruits & Légumes', 'Pains & Pâtisseries', 'Frais', 'Surgelés', 'Épicerie salée', 'Épicerie sucrée', 'Boissons', 'Bébé', 'Bio', 'Hygiène & Beauté', 'Entretien & Nettoyage', 'Animalerie', 'Bazar & Textile'],
  currencies:       ['€'],
  messageTypes:     ['standard', 'sticky', 'exec'],
  messageDisplay:   ['default', 'success', 'info', 'warning', 'danger'],
  appVersions:      ['~', '0.1.0', '0.2.0', '0.3.0', '0.3.1', '1.0.0', '1.0.1', '1.0.2', '1.0.3', '1.1.0']
})

.run(function($rootScope, $sce, $state, $location, $window, AuthSrv){
  'use strict';
  $rootScope.state = {toggle: true};

  $rootScope.toggleSidebar = function(){
    $rootScope.state.toggle = !$rootScope.state.toggle;
  };

  var mobileView = 992;
  $rootScope.$watch(function(){ return $window.innerWidth; }, function(newValue){
    if(newValue >= mobileView){
      if ($rootScope.state.toggle === undefined){
        $rootScope.state.toggle = true;
      }
    } else {
      $rootScope.state.toggle = false;
    }
  });

  $window.onresize = function(){ $rootScope.$apply(); };

  // Controls if user is authentified
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if(!(toState && toState.data && toState.data.access)){
      Logger.track('error', 'Access undefined for state <'+toState.name+'>');
      event.preventDefault();
    } else if(!AuthSrv.isAuthorized(toState.data.access)){
      Logger.track('error', 'Seems like you\'re not allowed to access to <'+toState.name+'> state...');
      event.preventDefault();

      if(fromState.url === '^'){
        if(AuthSrv.isLoggedIn()){
          $state.go('user.home');
        } else {
          $rootScope.error = null;
          $state.go('anon.login');
        }
      }
    }
  });

  // utils
  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest'){
      if(fn && (typeof(fn) === 'function')){
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.isActive = function (viewLocation) {
    var regex = new RegExp('^'+viewLocation+'$', 'g');
    return regex.test($location.path());
  };

  $rootScope.trustHtml = function(html){
    return $sce.trustAsHtml(html);
  };
});
