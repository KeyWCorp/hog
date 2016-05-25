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
            // sub-state insert
            /*
            list: {
              templateUrl: '/views/simple/list/list.simple.html',
              controller: 'ListSimpleCtrl',
              controllerAs: 'vm'
            },
            edit: {
               templateUrl: 'edit.simple.html',
               controller: 'EditSimpleCtrl',
               controllerAs: 'vm'
            },
            new: {
              templateUrl: '/views/simple/new/new.simple.html',
              controller: 'NewSimpleCtrl',
              controllerAs: 'vm'
            },
            */
          }
        });
});
