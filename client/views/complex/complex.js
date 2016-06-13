'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.complex',
        {
          url: 'complex',
          views: {
            '': {
              templateUrl: 'views/complex/complex.html',
              controller: 'ComplexCtrl',
              controllerAs: 'vm'
            },
          }
        });
});
