'use strict';

angular.module('hog')
    .service('Auth',
        function (socketFactory, $log, $q, $window, $rootScope, $state, $http)
        {
            /*var auth = socketFactory()
            auth.forward('error');
            auth.ioSocket = io.connect('localhost:9000/api/auth');

            auth.prefix = 'auth-';
            console.log('hitting connection');*/
             //var myIoSocket = io.connect('localhost:9000/api/pigs');
             //var myIoSocket = io.connect('10.1.10.26:9000/api/pigs');

              /*var pig = socketFactory({
                ioSocket: myIoSocket
              });*/
            var service = {
              login: function(username, password, provider)
              {
                $http
                  .post('/auth/' + provider, {username: username, password: password})
                  .success(
                    function (data, status, headers, config)
                    {
                      $window.sessionStorage.token = data.token;
                       $state.go('home.complex.list');
                      $rootScope.$broadcast('authenticated', data.token);
                     
                      $log.debug('status: ', status, 'login', data.token);
                    })
                  .error(
                    function (data, status, headers, config)
                    {
                      // Erase the token if the user fails to log in
                      delete $window.sessionStorage.token;

                      // Handle login errors here
                      $log.error('Error: Invalid user or password');
                  });
              },
              register: function(username, password, provider)
              {
                $log.debug('registering user: ', username, password, provider);
                $http
                  .post('/api/users/register', {username: username, password: password, provider: provider})
                  .success(
                    function (data, status, headers, config)
                    {
                      $window.sessionStorage.token = data.token;
                      $rootScope.$broadcast('authenticated', data.token);
                      $log.debug('login');
                    })
                  .error(
                    function (data, status, headers, config)
                    {
                      // Erase the token if the user fails to log in
                      delete $window.sessionStorage.token;

                      // Handle login errors here
                      $log.error('Error: Invalid user or password');
                  });
              },
              /*slogin: function(username, password, provider)
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
              slogout: function(uid)
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
              }*/
              
            }
            return service;
  });
