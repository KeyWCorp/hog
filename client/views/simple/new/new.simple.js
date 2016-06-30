/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.simple.new',
        {
          url: '/new',
          views:{
            new: {
              templateUrl: '/views/simple/new/new.simple.html',
              controller: 'NewSimpleCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
