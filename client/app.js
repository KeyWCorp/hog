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
    'ui.ace',
    'btford.socket-io',
    'uuid4',
    'vAccordion',
    'ngLodash'
]).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange');
})
  .config(function ( $urlRouterProvider , $locationProvider) {
    $urlRouterProvider
        .otherwise('/');
    $locationProvider.html5Mode(true);
  });
