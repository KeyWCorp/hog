/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.simple.list',
        {
          url: '/list',
          views:{
            list: {
              templateUrl: '/views/simple/list/list.simple.html',
              controller: 'ListSimpleCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
