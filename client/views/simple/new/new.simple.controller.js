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
    vm.script.nodes = vm.output_data.nodes;
    vm.script.links = vm.output_data.links;
  });

  vm.update = function (d)
  {
    console.log(JSON.stringify(d, null, 2));
  };

  vm.save = function ()
  {
    Runner.create(vm.script)
      .then(
          function(data)
          {
            vm.script = data.json;
            $state.go('home.complex.edit', {id: vm.script.id});
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
