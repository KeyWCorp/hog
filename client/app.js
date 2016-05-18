'use strict';

angular.module('hog', [
	'ngTable',
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
    'ngLodash',
    'chart.js',
    'md.data.table',
    'hog.hog-tracker',
    'pig.pig-flow',
    'pig.pig-flow-templates',
    'mdColors',
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
