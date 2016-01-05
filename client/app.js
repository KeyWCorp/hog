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
    'ngLodash'
])
  .config(function ( $urlRouterProvider , $locationProvider) {
    $urlRouterProvider
        .otherwise('/');

    $locationProvider.html5Mode(true);

  });
