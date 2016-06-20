'use strict';

angular.module('hog')
  .controller('LandingCtrl', function () {

    var vm = this;

    angular.extend(vm, {
      name: 'LandingCtrl',
      simplePigs: [{
        name: 'testSimple'
      }],
      complexPigs: [{
        name: 'testComplex'
      }]


    });

  });
