/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';
 
angular.module('hog')
  .config(function (  $stateProvider ) {
        $stateProvider
            .state('home.settings',
            {
                url: 'settings',
                views: {
                    '': {
                        templateUrl: 'views/settings/settings.html',
                        controller: 'SettingsCtrl',
                        controllerAs: 'vm'
                    },
                    // sub-state insert
                }
            });
  });