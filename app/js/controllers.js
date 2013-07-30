'use strict';

/* Controllers */

// its define host as global variable, BADDDD
// var host = 'http://localhost:3000/api'
var host = 'http://zuller.herokuapp.com/api'

angular.module('Zuller')
  .controller('MainCtrl', ['$scope', function($scope) {
  }])
  .controller('HomeCtrl', ['$scope', function($scope) {
    $scope.templateUrl = 'partials/home.html';
  }])
  .controller('PartiesCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.templateUrl = 'partials/parties.html';
    $http({ method: 'JSONP', url: host + '/parties.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data;
    });
  }])
  .controller('ZullerMyNightCtrl', ['$scope', '$http', 'sharedProperties',function($scope, $http, sharedProperties) {
    $scope.templateUrl = 'partials/zuller-my-night.html';
    $http({ method: 'JSONP', url: host + '/zuller_my_night.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data.parties;
      $scope.bars = data.bars;
      $scope.category = 'bars';
      $scope.setCurrentParty = function(party){
        sharedProperties.setCurrentParty(party);
      };
      $scope.setCurrentBar = function(bar){
        sharedProperties.setCurrentBar(bar);
      };
    })
  }])
  .controller('DetailedPartyCtrl', ['$scope','$routeParams', 'sharedProperties', function($scope, $routeParams,sharedProperties){
     $scope.party = sharedProperties.getCurrentParty();
  }])
  .controller('DetailedBarCtrl', ['$scope','$routeParams','sharedProperties', function($scope, $routeParams,sharedProperties){
     $scope.bar = sharedProperties.getCurrentBar();
  }]);