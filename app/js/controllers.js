'use strict';

/* Controllers */

// its define host as global variable, BADDDD
// var host = 'http://localhost:3000/api'
var host = 'http://zuller.herokuapp.com/api'

angular.module('Zuller')
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.colors = ['#2AFFA1', '#F31C1C', '#ddd'];
  }])
  .controller('PartiesCtrl', ['$scope', '$http', function($scope, $http) {
    $http({ method: 'JSONP', url: host + '/parties.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data;
    });
  }])
  .controller('ZullerMyNightCtrl', ['$scope', '$http', function($scope, $http) {
    $http({ method: 'JSONP', url: host + '/zuller_my_night.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data.parties;
      $scope.bars = data.bars;
      $scope.category = 'bars';
    });
  }]);