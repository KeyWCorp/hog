'use strict';
angular.module('hog')
  .controller('HeaderCtrl', function ($scope, $log, $mdSidenav, $state) {

    $scope.close = function (){
        $mdSidenav('left').close();
    }
    var vm = this;
    
    $scope.$on('stateChangeSuccess',
        function()
        {
            $mdSidenav('left').close();
            console.log('closing side menu');
        });
    angular.extend(vm, {
        name: 'Hog',
        menu: [
          {
            name: 'Settings',
            state: 'home.settings'
          },
          {
              name: 'Complex',
              state: 'home.complex',
              substates: [
                {
                  name: 'List',
                  state: 'home.complex.list',
                  tooltip: 'List Section will allow you the ability to run Pig command '
                },
                {
                  name: 'New',
                  state: 'home.complex.new',
                  tooltip: 'Complex Section Information goes here'
                }
              ]
          },
          {
            name: 'Simple',
            state: 'home.simple',
            substates: [
              {
                name: 'List',
                state: 'home.simple.list',
                tooltip: 'List Section will allow you the ability to run Pig command '
              },
              {
                name: 'New',
                state: 'home.simple.new',
                tooltip: 'Simple Section Information goes here'
              }
            ]
          },
         
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
        },
        originatorEv: null,
        openMenu: function($mdOpenMenu, ev)
        {
          vm.originatorEv = ev;
          $mdOpenMenu(ev);
        },
        goState: function(state)
        {
          $state.go(state);
        },
        clicked: function(nav, $mdOpenMenu, ev)
        {
          if(nav.substates)
          {
            vm.openMenu($mdOpenMenu, ev);
          }
          else
          {
            vm.goState(nav.state);
          }
        }
    });

  });
