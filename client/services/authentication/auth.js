'use strict';

angular.module('hog')
    .service('Auth',
        function (socketFactory, $q, $sessionStorage)
        {
            var auth = socketFactory()
            auth.forward('error');
            auth.ioSocket = io.connect('localhost:9000/api/pigs');

            auth.prefix = 'pig-';
            console.log('hitting connection');
             //var myIoSocket = io.connect('localhost:9000/api/pigs');
             //var myIoSocket = io.connect('10.1.10.26:9000/api/pigs');

              /*var pig = socketFactory({
                ioSocket: myIoSocket
              });*/
            var service = {
              login: function(username, password, provider)
              {
                var defer = $q.defer();
                //Log the user in
                auth.ioSocket.emit('authenticate', {user: username, pass: password});
                return defer.promise();
              },
              logout: function()
              {
                var defer = $q.defer();
                // Log the user out
              },
              isAuth: function()
              {
                var defer = $q.defer();
                // Is the user authenticated
                return defer.promise();
              },
              getAuth: function()
              {
                var defer = $q.defer();
                // Get the authenticated user and state
                return defer.promise();
              }
              
            }
            return auth;
  });