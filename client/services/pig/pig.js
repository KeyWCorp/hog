/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .service('Pig',
    function (socketFactory)
    {
      console.log('hitting connection');

      /*
       * Socket Settings
       */
      var myIoSocket = io.connect('/api/pigs');

      var pig = socketFactory({
        ioSocket: myIoSocket
      });
      return pig;
    });
