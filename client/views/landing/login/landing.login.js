'use strict';

angular.module('hog')
  .config(function ( $stateProvider )
  {
    $stateProvider
        .state('auth.login',
        {
            url: '/login',
            views: {
                '': {
                    templateUrl: 'views/landing/login/landing.login.html',
                    controller: 'LandingLoginCtrl',
                    controllerAs: 'vm'
                }
            },
        });
        
  });
