'use strict';

angular.module('hog')
    .service('Setting',
        function ($rootScope, $q, $window, $state, $log, $timeout, socketFactory)
        {
          var defer = $q.defer();
            $rootScope.$on('authenticated',
              function(event, token)
              {
                // resolve in another digest cycle
                $timeout(function() {
                    // create the socket
                    var setting = (function() {
                        return socketFactory({
                            ioSocket: io.connect('localhost:9000/api/settings', {
                                query: 'token=' + $window.sessionStorage.token
                            })
                        });
                    })();
                    $log.debug('new setting socket created with token', $window.sessionStorage.token, setting)
                    setting.on("error", function(error) {
                      if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
                        // redirect user to login page perhaps?
                        $state.go('auth.login');
                        console.log("User's token has expired", error);
                        defer.reject(error);
                      }
                    });
                    setting.on('connect',
                      function()
                      {
                        console.log('connected');
                        defer.notify(setting);
                      })
                    // resolve the promise
                    
                });
              });
          return defer.promise;
           /* console.log('hitting connection');
             var myIoSocket = io.connect('localhost:9000/api/settings');
             //var myIoSocket = io.connect('10.1.10.26:9000/api/settings');

              var setting = socketFactory({
                ioSocket: myIoSocket
              });
            return setting;*/
  });
