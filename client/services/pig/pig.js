'use strict';

angular.module('hog')
    .service('Pig',
        function ($q, $rootScope, $timeout, $log, $state, $window, socketFactory)
        {
            /*var pig = socketFactory()
            pig.forward('error');
            pig.ioSocket = io.connect('localhost:9000/api/pigs');

            pig.prefix = 'pig-';*/
  
            var defer = $q.defer();
            $rootScope.$on('authenticated',
              function(event, token)
              {
                // resolve in another digest cycle
                $timeout(function() {
                    // create the socket
                    var pig = (function() {
                        return socketFactory({
                            ioSocket: io.connect('localhost:9000/api/pigs', {
                                query: 'token=' + $window.sessionStorage.token
                            })
                        });
                    })();
                    $log.debug('new pig socket created with token', $window.sessionStorage.token, pig)
                    pig.on("error", function(error) {
                      if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
                        // redirect user to login page perhaps?
                        $state.go('auth.login');
                        console.log("User's token has expired", error);
                        defer.reject(error);
                      }
                    });
                    pig.on('connect',
                      function()
                      {
                        console.log('connected');
                        defer.notify(pig);
                      })
                    // resolve the promise
                    
                });
              });
            /*console.log('hitting connection');
             var myIoSocket = io.connect('localhost:9000/api/pigs');
             //var myIoSocket = io.connect('10.1.10.26:9000/api/pigs');

              var pig = socketFactory({
                ioSocket: myIoSocket
              });*/
            return defer.promise;
  });
