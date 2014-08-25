'use strict';

angular.module('app')

.controller('LoginCtrl', function ($scope, $state, AuthSrv){
  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function(){
    AuthSrv.login($scope.credentials).then(function(user){
      $state.go('user.home');
    }, function(error){
      Logger.track('error', 'Failed login with '+$scope.credentials.email+': '+error.message);
    });
  };
})


.controller('MainCtrl', function($scope, $state, AuthSrv){
  $scope.logout = function(){
    AuthSrv.logout().then(function(){
      $state.go('anon.login');
    });
  };
})


.controller('DashboardCtrl', function($scope){
  $scope.alerts = [
    {type: 'success', msg: 'Thanks for visiting! Feel free to create pull requests to improve the dashboard!'},
    {type: 'danger', msg: 'Found a bug? Create an issue with as many details as you can.'}
  ];

  $scope.addAlert = function(){
    $scope.alerts.push({msg: 'Another alert!'});
  };

  $scope.closeAlert = function(index){
    $scope.alerts.splice(index, 1);
  };
});
