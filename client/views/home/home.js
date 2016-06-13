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
        });

  });
