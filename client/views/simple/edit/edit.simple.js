'use strict';

angular.module('hog')
.config(function (  $stateProvider ) {
  $stateProvider
    .state('home.simple.edit',
        {
          url: '/edit/:id',
          views:{
            edit: {
              templateUrl: '/views/simple/edit/edit.simple.html',
              controller: 'EditSimpleCtrl',
              controllerAs: 'vm'
            }
          }
        });
});
