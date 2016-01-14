'use strict';
angular.module('hog')
  .controller('HeaderCtrl', function ($scope, $log, $mdSidenav,  $rootScope) {
    // on rootscope change
    $scope.close = function (){
        $mdSidenav('left').close();
    }
    var vm = this;
    console.log($rootScope);
    $scope.$on('stateChangeSuccess',
        function()
        {
            $mdSidenav('left').close();
            console.log('closeing side menu');
        });
    angular.extend(vm, {
        name: 'Hog Application',
        
        menu: [
            {
                name: 'Complex',
                state: 'home.complex',
                tooltip: 'Complex Section Information goes here',
                icon: 'view_list'
            },
            {
                name: 'Simple',
                state: 'home.simple',
                tooltip: 'Simple Section Information goes here',
                icon: 'view_list'
            },
            {
                name: 'List',
                state: 'home.complex.list',
                tooltip: 'List Section will allow you the ability to run Pig command ',
                icon: 'view_list'
                
            }
        ],
        toggleNav: function()
        {
            $log.debug('clicked')
            $mdSidenav('left').toggle()
                .then(
                    function()
                    {
                        $log.debug('slide');
                    });
        }
    });

  });
