'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $scope, $state, HogTemplates, Runner, Pig, $mdDialog)
    {
      var vm = this;

      vm.output_data = {};
      vm.running = false;
      vm.isRunning = {};
      vm.output = {};

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

        vm.scripts[idx].info_outputs = [];
        vm.scripts[idx].outputs = [];
        vm.scripts[idx].pigList = [];
        vm.scripts[idx].logs = [];
        vm.scripts[idx].warnings = [];
        vm.scripts[idx].errors = [];

        $log.debug('running: ', id);
        Runner.run(id)
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
                  vm.scripts[idx].progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[idx].logs.push(update.data.json);
                    vm.scripts[idx].info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[idx].warnings.push(update.data.json);
                    vm.scripts[idx].info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[idx].outputs.push(update.data.json);
                    vm.parseOutput(idx, update.data.json);


                    vm.scripts[idx].info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.scripts[idx].errors.push(update.data.json);
                  vm.scripts[idx].info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };

      vm.parseOutput = function (idx, data)
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
            vm.scripts[idx].pigList.push(output_data);
          }
        }

      };

      vm.edit = function(id)
      {
        $state.go('^.edit', {id: id});
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      vm.openGraphInfo = function(ev, idx)
      {
        $mdDialog.show({
          template: HogTemplates.graphInfoTemplate,
          controller: HogTemplates.GraphInfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            graph_data: vm.scripts[idx].pigList,
            script: vm.scripts[idx]
          },
        });
      };

      vm.openInfo = function(ev, idx, filter_type)
      {
        $mdDialog.show({
          template: HogTemplates.outputInfoTemplate,
          controller: HogTemplates.InfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_name: vm.scripts[idx].name,
            info_outputs: vm.scripts[idx].info_outputs,
            outputs: vm.scripts[idx].outputs,
            logs: vm.scripts[idx].logs,
            warnings: vm.scripts[idx].warnings,
            errors: vm.scripts[idx].errors,
            filter_type: filter_type,
            graph_data: vm.scripts[idx].pigList,
            openGraphInfo: vm.openGraphInfo,
            script_index: idx
          },
        });
      };

      angular.extend(vm, {
        name: 'ListSimpleCtrl',
      });
    });
