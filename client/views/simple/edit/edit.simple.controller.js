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
              vm.data_ready = true;

              vm.args = vm.script.args.join(" ");
              if (!vm.args)
              {
                vm.args = [];
                Settings.getp('pigArgs')
                  .then(
                      function(data)
                      {
                        data.json.data.forEach(
                            function(element)
                            {
                              //vm.args.push({arg: element.arg, input: element.default});
                              vm.args.push(element.arg);
                              vm.args.push(element.default);
                            });
                        vm.args = vm.args.join(" ");
                      },
                      function(err)
                      {
                        $log.error(err);
                      });
              }
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
        vm.script.args = vm.args.split(" ");
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

        $log.debug('running: ', vm.script._id);
        vm.log = [];
        console.log("ARGS: " + JSON.stringify(vm.script.args));
        Runner.run(vm.script._id)
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
                    vm.output.push(update.data.json);
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
