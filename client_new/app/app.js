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
        .state('complex', {
                        url: '/complex',
                        templateUrl: 'app/view/complex.html',
                        controller: 'ComplexCtrl'
                })
        .state('complex', {
                        url: '/complex',
                        templateUrl: 'app/view/complex.html',
                        controller: 'ComplexCtrl'
                })

});
