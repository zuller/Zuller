'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('Zuller.services', [])
  .service('sharedProperties', function () {

  var currentParty = 'error';
  var currentBar = 'error';
  var currentIndex = -1;

  return {
      getCurrentBar: function () {
        return currentBar;
      },
      setCurrentBar: function(value) {
        currentBar = value;
      },
      getCurrentParty: function() {
        return currentParty;
      },
      setCurrentParty: function(value) {
          currentParty = value;
      },
      setCurrentIndex: function(index){
        currentIndex = index;
      },
      getCurrentIndex: function(){
        return currentIndex;
      }
    };
  });
