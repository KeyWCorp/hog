'use strict';

angular.module('hog', [
    'ngRoute',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ngMessages',
    'ngMaterial',
    'ngMdIcons',
    'ui.router',
    'ui.ace','angAccordion',
    'btford.socket-io',
    'uuid4',
    'ngLodash'
]).run(function($rootScope){
  $rootScope = [];
}).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange')
    .warnPalette('red')
    .backgroundPalette('grey');
})
  .config(function ( $urlRouterProvider , $locationProvider) {
    $urlRouterProvider
        .otherwise('/');

    $locationProvider.html5Mode(true);

  });



