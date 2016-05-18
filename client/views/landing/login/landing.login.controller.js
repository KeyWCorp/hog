'use strict';
angular.module('hog')
  .controller('LandingLoginCtrl',
    function ($scope, $log, $state, Auth)
    {
      var vm = this;
      angular.extend(vm, {
        login: Auth.login,
        logout: Auth.logout
      });
    });
