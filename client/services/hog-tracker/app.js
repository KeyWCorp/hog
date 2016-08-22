/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

var myApp = angular.module('myApp', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'hog.hog-tracker',
    'ngMessages',
    'ngMaterial',
    'md.data.table',
    'btford.socket-io'
]);

myApp.config(['$routeProvider', '$locationProvider', '$compileProvider',
    function($routeProvider, $locationProvider, $compileProvider) {
        /**
        setup - whitelist, appPath, html5Mode
        @toc 1.
        */
        $locationProvider.html5Mode(false);     //can't use this with github pages / if don't have access to the server

        var staticPath;
        staticPath ='/';        //nodejs (local)
        var appPathRoute ='/';
        var pagesPath =staticPath+'pages/';


        $routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html'});

        $routeProvider.otherwise({redirectTo: appPathRoute+'home'});

    }]);

myApp.factory('socket', function (socketFactory) {
    var myIoSocket = io.connect('http://localhost:3000');

    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });

    return mySocket;
});
