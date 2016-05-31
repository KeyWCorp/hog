'use strict';

angular.module('hog')
  .controller('HomeCtrl', function ($scope, $state, $log, $mdDialog, Idle, auth) {

    var vm = this;
    $scope.vm = vm;
    $scope.$on('IdleStart', function() {
      /* user is idle*/
      console.log('session idle');
      vm.idleCount = 6;
      vm.idleMax = 5;
      $mdDialog.show({
         // scope: $scope,
          preserveScope: true,
          controller: function DialogController($scope, $mdDialog, $timeout, Idle, Auth) {
            var vm = this;
            $scope.idleMax = 30;
            $scope.idleCount = 30;
            $scope.closeDialog = function()
            {
              $mdDialog.hide();
            }
            $scope.$on('IdleWarn',
              function(e, countdown)
              {
                //$scope.idleCount = countdown;
                $timeout(
                  function()
                  {
                    $scope.idleCount = countdown;
                  })
                  //$scope.idleCount = countdown;
                //$scope.vm.idleCount = countdown;
                console.log('Idle update: ', countdown);
              });
            $scope.$on('IdleTimeout', function() {
                // the user has timed out (meaning idleDuration + timeout has passed without any activity)
                // this is where you'd log them
                $scope.closeDialog();
                Auth.logout();
            });

            $scope.$on('IdleEnd', function() {
                // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
              $scope.closeDialog();
            });
          },
          controllerAs: "DialogController as vm",
          templateUrl: 'views/home/idle.tmpl.html',
          //parent: angular.element(document.body),
         // targetEvent: e,
        });
    });
   Idle.watch();


    $scope.$on('Keepalive', function() {
        // do something to keep the user's session alive
      auth.keepAlive();
    });
    angular.extend(vm, {
        name: 'HomeCtrl',
    });

  });
