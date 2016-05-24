'use strict';
angular.module('hog')
  .controller('LandingLoginCtrl',
    function ($scope, $log, $state, Auth)
    {
      var vm = this;
      angular.extend(vm, {
        login: Auth.login,
        logout: Auth.logout,
        register: function(u,p,ap)
        {
          $log.debug('clicked register');
          Auth.register(u,p,ap)
            .then(
              function(user)
              {
                $log.debug('user: ', user);
              });
        },
        providers: [
          {
            name: 'local',
            display: 'Local'
          },
          {
            name: 'ldap',
            display: 'LDAP'
          }
          
        ]
      });
    });
