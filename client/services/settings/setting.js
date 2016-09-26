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
      //var myIoSocket = io.connect('<server_ip>:<server_port>/api/settings');

      var setting = socketFactory({
        ioSocket: myIoSocket
      });
      return setting;
    });
