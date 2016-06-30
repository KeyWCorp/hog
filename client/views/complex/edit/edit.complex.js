/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.complex.edit',
        {
          url: '/edit/:id',
          views:{
            edit: {
              templateUrl: '/views/complex/edit/edit.complex.html',
              controller: 'EditComplexCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
