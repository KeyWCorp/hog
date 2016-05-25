'use strict';

angular.module('hog')

.controller('EditSimpleCtrl', function ($log, $scope, $state, $stateParams, HogTemplates, Runner, Pig, $mdToast, $mdDialog)
    {
      var vm = this;

      vm.output_data = {};
      vm.script = {};
      vm.data = {};
      vm.running = false;
      vm.data_ready = false;
      vm.edited = false;

      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.selectedArgs = [];
      vm.editorModel = '';
      vm.progress = 0;

      vm.onEditorLoad = function(_ace)
      {
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          console.log('ace: ', _ace);
          console.log('session: ', _ace.getSession());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        }
        _ace.$blockScrolling = Infinity;
      };
      vm.onEditorChange = function(_ace)
      {

      };

      vm.editorOptions = {
        mode: vm.mode.toLowerCase(),
        onLoad: function(_ace) {vm.onEditorLoad(_ace);},
        useWrapMode: false,
        showGutter: false,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange(),
        readOnly: true
      };


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

      $scope.$watch('vm.output_data.nodes', function(newValue, oldValue)
          {
            if (newValue !== vm.script.data)
            {
              vm.edited = true;
            }
            else
            {
              vm.edited = false;
            }

            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";
          }, true);

      $scope.$watch('vm.output_data.script', function(newValue, oldValue)
          {
            if (newValue !== vm.script.data)
            {
              vm.edited = true;
            }
            else
            {
              vm.edited = false;
            }

            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";
          });

      vm.editComplex = function ()
      {
        $state.go('home.complex.edit', {id: vm.script._id});
      };

      vm.save = function (cb)
      {
        vm.script.args = vm.args.split(" ");
        vm.script.name = vm.script.name.replace(/\s/g, "_");
        Runner.save(vm.script)
          .then(
              function(data)
              {
                $log.debug('saved: ' + data);
                vm.script = data.json;

                $mdToast.show(
                  $mdToast.simple()
                  .content('Script Saved!')
                  .hideDelay(3000)
                );
                if (cb)
                {
                  cb();
                }
                vm.edited = false;
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

      vm.saveAndRun = function ()
      {
        vm.save(function ()
        {
          vm.run();
        });
      };

      vm.run = function()
      {
        vm.running = true;
        $log.debug('running: ', vm.script._id);

        vm.info_outputs = [];
        vm.outputs = [];
        vm.pigList = [];
        vm.logs = [];
        vm.warnings = [];
        vm.errors = [];

        console.log("ARGS: " + JSON.stringify(vm.script.args));
        Runner.run(vm.script._id)
          .then(
              function(end)
              {
                console.log("END");
              },
              function(error)
              {
                console.log("ERROR: " + JSON.stringify(error));
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
                    vm.logs.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.warnings.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.outputs.push(update.data.json);
                    vm.parseOutput(update.data.json);

                    vm.info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };

      vm.parseOutput = function (data)
      {
        var failed = false;
        try
        {
          var tmp_data = data
            .replace(/\(/g, "[")
            .replace(/\)/g, "]");

          var output_data = JSON.parse(tmp_data);
        }
        catch (err)
        {
          failed = true;
        }
        finally
        {
          if (!failed)
          {
            vm.pigList.push(output_data);
          }
        }

      };



      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      angular.extend(this, {
        name: 'EditSimpleCtrl',
        running: false
      });

      vm.openGraphInfo = function(ev, graph_data, script)
      {
        $mdDialog.show({
          template: HogTemplates.graphInfoTemplate,
          controller: HogTemplates.GraphInfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            graph_data: graph_data || vm.pigList,
            script: script || vm.script
          },
        });
      };

      vm.openInfo = function(ev, filter_type)
      {
        $mdDialog.show({
          template: HogTemplates.outputInfoTemplate,
          controller: HogTemplates.InfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_name: vm.script.name,
            info_outputs: vm.info_outputs,
            outputs: vm.outputs,
            logs: vm.logs,
            warnings: vm.warnings,
            errors: vm.errors,
            filter_type: filter_type,
            graph_data: vm.pigList,
            openGraphInfo: vm.openGraphInfo,
            script_index: null
          },
        });
      };

    });
