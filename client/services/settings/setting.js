/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .service('Setting',
    function (socketFactory)
    {
      console.log('hitting connection');

      /*
       * Local setting
       */
      var myIoSocket = io.connect('localhost:9000/api/settings');

      /*
       * Server setting
       */
      //var myIoSocket = io.connect('10.1.10.26:9000/api/settings');

      var setting = socketFactory({
        ioSocket: myIoSocket
      });
      return setting;
    });
