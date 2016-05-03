'use strict';

angular.module('hog')
.controller('NewSimpleCtrl', function ($scope, $state, $log, Runner, $mdToast)
    {
      var vm = this;

      vm.data = {
        nodes: [],
        links: []
      };

      vm.output_data = {};
      vm.script = {
        name: "",
        data: "",
        args: [{arg: '-x', input: "local"}],
        bar: true,
        line: false,
        radar: false
      };

      $scope.$watch('vm.output_data', function()
          {
            vm.script.data = vm.output_data.script;
          });

      vm.update = function (d)
      {
        console.log(JSON.stringify(d, null, 2));
      };

      vm.save = function ()
      {
        if (angular.isDefined(vm.script.id))
        {
          console.log("HAS IT!!!")
          Runner.save(vm.script)
            .then(
                function(data)
                {
                  $mdToast.show(
                      $mdToast.simple()
                      .content('Settings Saved!')
                      .position('top right')
                      .hideDelay(3000)
                      );
                  vm.script = data.json;
                });
        }
        else
        {
          Runner.create(vm.script)
            .then(
                function(data)
                {
                  vm.script = data.json;
                  console.log("ID: " + vm.script.id);
                });
        }
                  $state.go('home.complex.edit', {id: vm.script.id});
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      angular.extend(vm, {
        name: 'NewSimpleCtrl'
      });
    });
