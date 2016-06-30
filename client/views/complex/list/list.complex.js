/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function ( $stateProvider ) {

  $stateProvider
    .state('home.complex.list',
        {
          url: '/list',
          views: {
            list: {
              templateUrl: 'views/complex/list/list.complex.html',
              controller: 'ListComplexCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
