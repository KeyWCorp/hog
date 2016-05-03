'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $scope, $state, Runner, Pig)
    {
      var vm = this;

      vm.output_data = {};
      vm.running = false;
      vm.isRunning = {};
      vm.output = {};

      vm.getScripts = function ()
      {
        Runner.list()
          .then(
              function (data)
              {
                vm.scripts = data.json.filter(function (script)
                    {
                      return script.type === "simple";
                    });
              });
      };
      vm.getScripts();

      Pig.on('run:finished', function ()
          {
            vm.running = false;
            Object.keys(vm.isRunning).map(function (key)
                {
                  if (vm.isRunning[key] === true)
                  {
                    vm.isRunning[key] = false;
                  }
                });
          });

      vm.run = function(id, idx)
      {
        vm.output[id] = [];
        vm.running = true;
        vm.isRunning[id] = true;

        $log.debug('running: ', id);
        vm.log = [];
        Runner.run(id)
          .then(
              function(out)
              {
              },
              function(err)
              {
                vm.outError = err.json;
              },
              function(update)
              {
                if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.log.push(update.data.json);
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    var tmp_output = "(";
                    for (var i = 0; i < Object.keys(update.data.json).length; i++) {
                      var key = Object.keys(update.data.json)[i];
                      tmp_output += update.data.json[key];
                      if (i + 1 < Object.keys(update.data.json).length) {
                        tmp_output += ", ";
                      }
                    }
                    tmp_output += ")\n";

                    vm.output[id].push(tmp_output);
                  }
                }
              });
      };

      vm.edit = function(id)
      {
        $state.go('^.edit', {id: id});
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      angular.extend(vm, {
        name: 'ListSimpleCtrl',
      });
    });
