'use strict';

var hogApp = angular.module('hog', [
   'ui.router'
]);

hogApp.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
        .state('home', {
                        url: '/home',
                        templateUrl: 'app/view/home.html'
                })

});
