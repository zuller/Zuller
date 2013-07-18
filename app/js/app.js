'use strict';


// Declare app level module which depends on filters, and services
angular.module('Zuller', ['Zuller.filters', 'Zuller.services', 'Zuller.directives','angular-carousel'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', { templateUrl: 'partials/main.html', controller: 'MainCtrl' })
      .when('/zuller-my-night', { templateUrl: 'partials/zuller-my-night.html', controller: 'ZullerMyNightCtrl' })
      .when('/parties', { templateUrl: 'partials/parties.html', controller: 'PartiesCtrl' })
      .otherwise({ redirectTo: '/' });
  }]);
