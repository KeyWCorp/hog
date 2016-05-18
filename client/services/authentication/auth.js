'use strict';

angular.module('hog')
    .service('Auth',
        function (socketFactory, $q, $window, $rootScope, $state)
        {
            var auth = socketFactory()
            auth.forward('error');
            auth.ioSocket = io.connect('localhost:9000/api/auth');

            auth.prefix = 'auth-';
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
                auth.ioSocket.on('authn',
                  function(data)
                  {
                    if(data.status == 200)
                    {
                      // Do session token stuff
                      $window.sessionStorage.token = data.token
                      $rootScope.$broadcast('authenticated', data.token);
                      defer.resolve();
                    }
                    else if (data.status == 500)
                    {
                      // Do error stuff
                      delete $window.sessionStorage.token;
                      defer.reject(data.err);
                    }
                  });
                return defer.promise();
              },
              logout: function(uid)
              {
                var defer = $q.defer();
                auth.ioSocket.emit('unauthenticate', {uid: uid});
                auth.ioSocket.on('unauthn',
                  function(data)
                  {
                    if(data.status == 200)
                    {
                      delete $window.sessionStorage.token;
                      $rootScope.$broadcast('unauthenticated', null);
                      // Do session token stuff
                      defer.resolve();
                    }
                    else if (data.status == 500)
                    {
                      // Do error stuff
                      $rootScope.$broadcast('unauthenticated', null);
                      delete $window.sessionStorage.token;
                      defer.reject(data.err);
                    }
                  });
                // Log the user out
              },
              isAuthIntersepter: function()
              {
                return {
                  request: function (config)
                  {
                    config.headers = config.headers || {};
                    if ($window.sessionStorage.token)
                    {
                      config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                    }
                    return config;
                  },
                  response: function (response)
                  {
                    if (response.status === 401)
                    {
                      $state.go('auth')
                      // handle the case where the user is not authenticated
                    }
                    return response || $q.when(response);
                  }
                }
              },
              isAuth: function()
              {
                var defer = $q.defer();
                if ($window.sessionStorage.token)
                {
                  defer.resolve();
                }
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
