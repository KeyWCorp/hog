'use strict';
console.log

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
        args: [],
        bar: true,
        line: false,
        radar: false
      };
      vm.args = "-x local";

      $scope.$watch('vm.output_data', function()
          {
            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";
          });

      vm.update = function (d)
      {
        console.log(JSON.stringify(d, null, 2));
      };

      vm.save = function ()
      {
        vm.script.args = vm.args.split(" ");
        if (!vm.script.args)
        {
          vm.script.args = ["-x", "local"];
        }

        vm.script.name = vm.script.name.replace(/\s/g, "_");
        Runner.create(vm.script)
          .then(
              function(data)
              {
                vm.script = data.json;
                $mdToast.show(
                    $mdToast.simple()
                    .content('Script Saved!')
                    .hideDelay(3000)
                    );
                $state.go('^.edit', {id: vm.script._id});
              });
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      angular.extend(vm, {
        name: 'NewSimpleCtrl'
      });
    });
