/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.simple',
        {
          url: 'simple',
          views: {
            '': {
              templateUrl: 'views/simple/simple.html',
              controller: 'SimpleCtrl',
              controllerAs: 'vm'
            },
          }
        });
});
