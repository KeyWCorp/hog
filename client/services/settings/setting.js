'use strict';

angular.module('hog')
    .service('Setting',
        function (socketFactory)
        {
            console.log('hitting connection');
             //var myIoSocket = io.connect('localhost:9000/api/settings');
             var myIoSocket = io.connect('10.1.10.26:9000/api/settings');

              var setting = socketFactory({
                ioSocket: myIoSocket
              });
            return setting;
  });
