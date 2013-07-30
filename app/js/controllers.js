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
  .controller('PartiesCtrl', ['$scope', '$http', '$location', 'sharedProperties', function($scope, $http, $location, sharedProperties) {
    $scope.templateUrl = 'partials/parties.html';
    $scope.onPartyClicked = function(party) {
        sharedProperties.setCurrentParty(party);
        $location.path('parties/' + party._id);
      }
    $http({ method: 'JSONP', url: host + '/parties.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data;
    });
  }])
  .controller('ZullerMyNightCtrl', ['$scope', '$http', '$location', 'sharedProperties',function($scope, $http, $location, sharedProperties) {
    $scope.templateUrl = 'partials/zuller-my-night.html';
    $http({ method: 'JSONP', url: host + '/zuller_my_night.js?callback=JSON_CALLBACK' }).success(function(data) {
      $scope.parties = data.parties;
      $scope.bars = data.bars;
      $scope.category = 'bars';
      $scope.onPartyClicked = function(party) {
        sharedProperties.setCurrentParty(party);
        $location.path('parties/' + party._id);
      };
      $scope.onBarClicked = function(bar) {
        sharedProperties.setCurrentBar(bar);
        $location.path('bars/' + bar._id);
      };
    })
  }])
  .controller('DetailedPartyCtrl', ['$scope','$routeParams', 'sharedProperties', function($scope, $routeParams,sharedProperties){
     $scope.party = sharedProperties.getCurrentParty();
  }])
  .controller('DetailedBarCtrl', ['$scope','$routeParams','sharedProperties', function($scope, $routeParams,sharedProperties){
     $scope.bar = sharedProperties.getCurrentBar();
  }]);