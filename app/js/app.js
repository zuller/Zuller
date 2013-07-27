'use strict';


// Declare app level module which depends on filters, and services
angular.module('Zuller', ['Zuller.filters', 'Zuller.services', 'Zuller.directives'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', { templateUrl: 'partials/main.html', controller: 'MainCtrl' })
      .when('/parties/:partyId',{ templateUrl: 'partials/detailed.html', controller: 'DetailedCtrl'})
	  .otherwise({ redirectTo: '/' });
  }]);



