'use strict';

angular.module('hog')

.controller('EditSimpleCtrl', function ($log, $scope, $state, $stateParams, Runner, Pig, $mdToast, $mdDialog)
    {
      var vm = this;

      vm.output_data = {};
      vm.script = {};
      vm.data = {};
      vm.running = false;
      vm.data_ready = false;


      Runner.get($stateParams.id)
        .then(
            function(data)
            {
              angular.copy(data.json, vm.script);
              angular.copy(data.json, vm.data);
              console.log("DATA: " + JSON.stringify(data.json, null, 2));
              vm.data_ready = true;
            });


      $scope.$watch('vm.output_data.script', function()
          {
            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";
          });

      vm.save = function ()
      {
        vm.script.name = vm.script.name.replace(/\s/g, "_");
        Runner.save(vm.script)
          .then(
              function(data)
              {
                $log.debug('saved: ' + data);
              },
              function(err)
              {
                $log.error('error: ' +err);
              });
      };

      Pig.on('run:finished', function ()
        {
          vm.running = false;
        });

      vm.run = function()
      {
        vm.output = [];
        vm.running = true;

        $log.debug('running: ', vm.script.id);
        vm.log = [];
        Runner.run(vm.script.id)
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
                if (update.type == 'progress')
                {
                  vm.progress = update.data.json;
                }
                else if (update.type == 'log')
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

                    vm.output.push(tmp_output);
                  }
                }
              });
      };


      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      angular.extend(this, {
        name: 'EditSimpleCtrl',
        running: false
      });

    });
