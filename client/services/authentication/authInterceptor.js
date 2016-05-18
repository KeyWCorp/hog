'use strict';

angular.module('hog')
  .factory('authInterceptor',
    function ($rootScope, $q, $window, $state)
    {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($window.sessionStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            $state.go('auth.login');
            // handle the case where the user is not authenticated
          }
          return response || $q.when(response);
        }
      };
    });