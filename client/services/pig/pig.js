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
       * Locally
       */
      var myIoSocket = io.connect('localhost:9000/api/pigs');

      /*
       * On server
       */
      //var myIoSocket = io.connect('10.1.10.26:9000/api/pigs');

      var pig = socketFactory({
        ioSocket: myIoSocket
      });
      return pig;
    });
