/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.landing',
        {
          url: 'landing',
          views: {
            '': {
              templateUrl: 'views/landing/landing.html',
              controller: 'LandingCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
