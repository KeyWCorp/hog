/**
  @toc
  1. setup - whitelist, appPath, html5Mode
  */

'use strict';

angular.module('myApp', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',		//additional angular modules
    'ngMaterial',
    'pig.pig-flow',
    'pig.pig-flow-templates'
]).
config(['$routeProvider', '$locationProvider', '$compileProvider', function($routeProvider, $locationProvider, $compileProvider) {
  /**
    setup - whitelist, appPath, html5Mode
    @toc 1.
    */
  $locationProvider.html5Mode(false);		//can't use this with github pages / if don't have access to the server

  // var staticPath ='/';
  var staticPath;
  // staticPath ='/angular-directives/pig-flow/';		//local
  staticPath ='/';		//nodejs (local)
// staticPath ='/pig-flow/';		//gh-pages
var appPathRoute ='/';
var pagesPath =staticPath+'pages/';


$routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html'});

$routeProvider.otherwise({redirectTo: appPathRoute+'home'});

}]);
