'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $scope, $state, Runner)
    {
      var vm = this;

      vm.getScripts = function ()
      {
        Runner.list()
          .then(
              function (data)
              {
                vm.scripts = data.json.filter(function (script)
                {
                  return script;
                });
                console.log(data.json);
              });
      };
      vm.getScripts();

      angular.extend(vm, {
        name: 'ListSimpleCtrl',
      });
    });
