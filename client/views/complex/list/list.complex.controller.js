'use strict';

angular.module('hog')
.controller('ListComplexCtrl', function ($log, $state, HogTemplates, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval, Pig)
  {
    var vm = this;

    vm.isRunning = {};
    vm.running = false;

    vm.current_running_id = "";

    vm.modes = ['Pig_Latin'];
    vm.themes = ['monokai', 'twilight', 'none'];
    vm.mode = vm.modes[0];
    vm.theme = vm.themes[0];
    vm.selectedArgs = [];
    vm.editorModel = '';
    vm.progress = 0;
    vm.filter_disabled = false;
    vm.filter_noCache = false;
    vm.searchText = "";
    vm.selectedItem = null;
    vm.onEditorLoad = function(_ace)
    {
      vm.modeChanged = function () {
        console.log('changing mode to: ' + vm.mode.toLowerCase());
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

    Pig.on('run:finished', function ()
        {
          vm.running = false;
          vm.current_running_id = "";
        });

    angular.extend(vm, {
      name: 'ListComplexCtrl',
      scripts: [],
      edit: function(id)
      {
        $state.go('^.edit', {id: id});

      },
      deleteScript: function(ev, id)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.deleteDialogTemplate,
          controller: HogTemplates.DeleteDialogController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_id: id,
            cb: function (data)
            {
              Runner.list()
                .then(
                    function(data)
                    {
                      vm.scripts = [];
                      vm.scripts = data.json;
                    });
            }
          },
        });
      },
      kill: function(id)
      {
        Runner.kill(id)
          .then(
              function(data)
              {
                console.log("Killed: " + JSON.stringify(data, null, 2));
              });
      },
      run: function(id, idx)
      {
        vm.isRunning[id] = true;
        vm.running = true;
        vm.current_running_id = id;

        vm.scripts[idx].info_outputs = [];
        vm.scripts[idx].outputs = [];
        vm.scripts[idx].pigList = [];
        vm.scripts[idx].logs = [];
        vm.scripts[idx].warnings = [];
        vm.scripts[idx].errors = [];

        var processPercent = 0;

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
      },
      runAndTrack: function(id, idx)
      {
        vm.isRunning[id] = true;
        vm.running = true;

        vm.scripts[idx].info_outputs = [];
        vm.scripts[idx].outputs = [];
        vm.scripts[idx].pigList = [];
        vm.scripts[idx].logs = [];
        vm.scripts[idx].warnings = [];
        vm.scripts[idx].errors = [];

        var processPercent = 0;

        Runner.runAndTrack(id)
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

                    var tmp_output = "(";
                    for (var i = 0; i < Object.keys(update.data.json).length; i++) {
                      var key = Object.keys(update.data.json)[i];
                      tmp_output += update.data.json[key];
                      if (i + 1 < Object.keys(update.data.json).length) {
                        tmp_output += ", ";
                      }
                    }
                    tmp_output += ")\n";

                    vm.scripts[idx].outputs.push(tmp_output);
                    vm.parseOutput(idx, tmp_output);


                    vm.scripts[idx].info_outputs.push({data: tmp_output, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.scripts[idx].errors.push(update.data.json);
                  vm.scripts[idx].info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      },
      parseOutput: function (idx, data)
      {
        var failed = false;
        try
        {
          var tmp_data = data
            .replace(/\(/g, "[")
            .replace(/\)/g, "]")
            .replace(/(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(\w+\.*))/g, '"$1$2"');

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

      }

    });
    // Percent Data figures out the percentage to place
    // keep percent lower than 100%
    function percent_data (current)
    {
      var currentPer = current;
      var top = 95;
      if (currentPer < top)
      {
        currentPer = currentPer + 3;
      }
      else
      {
        currentPer = currentPer;
      }
      return currentPer;
    }
    //Do not delete
    Runner.list()
      .then(
          function(data)
          {
            // Might Need to Parse it
            vm.scripts = data.json;
          });

    vm.openGraphInfo = function(ev, idx)
    {
      $mdDialog.show({
        templateUrl: HogTemplates.graphInfoTemplate,
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
        templateUrl: HogTemplates.outputInfoTemplate,
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

    // * Create filter function for a query string

    vm.createFilterFor = function(query)
    {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(script)
      {
        return (angular.lowercase(script.name).indexOf(lowercaseQuery) === 0);
      };
    }
    vm.querySearch = function(query)
    {
      var results = query ? vm.scripts.filter( vm.createFilterFor(query) ) : vm.scripts;
      return results;
    }
  });

