angular.module('app', ['ui.router', 'ngResource'])

.constant('apiUrl', '/api')

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('app', {
    abstract: true,
    url: '',
    templateUrl: 'views/main.html'
  })
  .state('app.list', {
    url: '/',
    templateUrl: 'views/list.html',
    controller: 'ListCtrl'
  })
  .state('app.create', {
    url: '/create',
    templateUrl: 'views/detail.html',
    controller: 'CreateCtrl'
  })
  .state('app.edit', {
    url: '/edit/:id',
    templateUrl: 'views/detail.html',
    controller: 'EditCtrl'
  });
  $urlRouterProvider.otherwise('/');
})

// the global controller
.controller('AppCtrl', function($scope, $location){
  // the very sweet go function is inherited to all other controllers
  $scope.go = function (path){
    $location.path(path);
  };
})

// the list controller
.controller('ListCtrl', function($scope, $resource, apiUrl){
  var Celebrities = $resource(apiUrl + '/celebrities'); // a RESTful-capable resource object
  $scope.celebrities = Celebrities.query(); // for the list of celebrities in public/html/main.html
})

// the create controller
.controller('CreateCtrl', function($scope, $resource, $timeout, apiUrl){
  // to save a celebrity
  $scope.save = function(){
    var CreateCelebrity = $resource(apiUrl + '/celebrities/new'); // a RESTful-capable resource object
    CreateCelebrity.save($scope.celebrity); // $scope.celebrity comes from the detailForm in public/html/detail.html
    $timeout(function(){ $scope.go('/'); }); // go back to public/html/main.html
  };
})

// the edit controller
.controller('EditCtrl', function($scope, $resource, $stateParams, $timeout, apiUrl){
  var celebrityId = $stateParams.id;
  var ShowCelebrity = $resource(apiUrl + '/celebrities/:id', {id:'@id'}); // a RESTful-capable resource object
  if (celebrityId){
    // retrieve the corresponding celebrity from the database
    // $scope.celebrity.id.$oid is now populated so the Delete button will appear in the detailForm in public/html/detail.html
    $scope.celebrity = ShowCelebrity.get({id: celebrityId});
    $scope.dbContent = ShowCelebrity.get({id: celebrityId}); // this is used in the noChange function
  }

  // decide whether to enable or not the button Save in the detailForm in public/html/detail.html 
  $scope.noChange = function(){
    return angular.equals($scope.celebrity, $scope.dbContent);
  };

  // to update a celebrity
  $scope.save = function(){
    var UpdateCelebrity = $resource(apiUrl + '/celebrities/' + celebrityId); // a RESTful-capable resource object
    UpdateCelebrity.save($scope.celebrity); // $scope.celebrity comes from the detailForm in public/html/detail.html
    $timeout(function(){ $scope.go('/'); }); // go back to public/html/main.html
  };

  // to delete a celebrity
  $scope.delete = function(){
    var DeleteCelebrity = $resource(apiUrl + '/celebrities/' + celebrityId); // a RESTful-capable resource object
    DeleteCelebrity.delete(); // $scope.celebrity comes from the detailForm in public/html/detail.html
    $timeout(function(){ $scope.go('/'); }); // go back to public/html/main.html
  };
});
