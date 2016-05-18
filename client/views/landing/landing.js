'use strict';

angular.module('hog')
  .config(function ( $stateProvider )
  {
    $stateProvider
        .state('auth',
        {
            url: '/auth',
            views: {
                'header': {
                    templateUrl: 'views/landing/header.landing.html',
                    controller: 'LandingHeaderCtrl',
                    controllerAs: 'vm'
                },
                '': {
                    templateUrl: 'views/landing/landing.html',
                    controller: 'LandingCtrl',
                    controllerAs: 'vm'
                }
            },
        });
        
  });
