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
       * Socket setting
       */
      var myIoSocket = io.connect('/api/settings');

      var setting = socketFactory({
        ioSocket: myIoSocket
      });
      return setting;
    });
