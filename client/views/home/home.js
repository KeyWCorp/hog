/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.config(function ( $stateProvider ) {

  $stateProvider
    .state('home',
        {
          url: '/',
          views: {
            'header': {
              templateUrl: 'views/home/header.home.html',
              controller: 'HeaderCtrl',
              controllerAs: 'vm'
            },
            '': {
              templateUrl: 'views/home/home.html',
              controller: 'HomeCtrl',
              controllerAs: 'vm'
            }
          },
          resolve: {
            simpleObj: function ($q, $timeout, $state)
            {
              var deferred = $q.defer();

              $timeout(function()
              {
                console.log($state.current.url);
                if ($state.current.url === "/")
                {
                  $state.go('home.landing');
                }
              }, 500);
              return deferred.process;
            }
          }
        });
});
