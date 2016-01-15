'use strict';

var hogApp = angular.module('hog', [
   'ui.router'
]);
var templatePath = 'app/pages/';

hogApp.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        .state('home', {
                        url: '/home',
                        templateUrl: templatePath + 'home/home.html'
                })
        .state('complex', {
                        url: '/complex',
                        templateUrl: templatePath + 'complex/complex.html'
                    //    controller: 'ComplexCtrl'
                })
        .state('complex.list', {
                        url: '/complex/list',
                        templateUrl: templatePath + 'complex/complex.list.html'
                });
    $urlRouterProvider.otherwise('/home');
});