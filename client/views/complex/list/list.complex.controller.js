'use strict';

angular.module('hog')
.controller('ListComplexCtrl', function ($log, $state, HogTemplates, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval, Pig, lodash)
  {
    var vm = this;

    vm.isRunning = {};
    vm.running = false;
    vm.scripts = {};

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
                      vm.scripts = {};
                      vm.scripts = lodash.keyBy(data.json, '_id');
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
      run: function(id)
      {
        vm.isRunning[id] = true;
        vm.running = true;
        vm.current_running_id = id;

        vm.scripts[id].info_outputs = [];
        vm.scripts[id].outputs = [];
        vm.scripts[id].pigList = [];
        vm.scripts[id].logs = [];
        vm.scripts[id].warnings = [];
        vm.scripts[id].errors = [];

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
                  vm.scripts[id].progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].logs.push(update.data.json);
                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].warnings.push(update.data.json);
                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].outputs.push(update.data.json);
                    vm.parseOutput(id, update.data.json);

                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.scripts[id].errors.push(update.data.json);
                  vm.scripts[id].info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      },
      parseOutput: function (id, data)
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
            vm.scripts[id].pigList.push(output_data);
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
            //vm.scripts = data.json;
            vm.scripts = lodash.keyBy(data.json, '_id');
          });

    vm.openGraphInfo = function(ev, id)
    {
      $mdDialog.show({
        templateUrl: HogTemplates.graphInfoTemplate,
        controller: HogTemplates.GraphInfoController,
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        targetEvent: ev,
        bindToController: true,
        locals: {
          graph_data: vm.scripts[id].pigList,
          script: vm.scripts[id]
        },
      });
    };

    vm.openInfo = function(ev, id, filter_type)
    {
      $mdDialog.show({
        templateUrl: HogTemplates.outputInfoTemplate,
        controller: HogTemplates.InfoController,
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          script_name: vm.scripts[id].name,
          info_outputs: vm.scripts[id].info_outputs,
          outputs: vm.scripts[id].outputs,
          logs: vm.scripts[id].logs,
          warnings: vm.scripts[id].warnings,
          errors: vm.scripts[id].errors,
          filter_type: filter_type,
          graph_data: vm.scripts[id].pigList,
          openGraphInfo: vm.openGraphInfo,
          script_id: id
        },
      });
    };

    // * Create filter function for a query string

    vm.createFilterFor = function(query)
    {
      var lowercaseQuery = lodash.toLower(query);
      return function filterFn(script)
      {
        return (lodash.toLower(script.name).indexOf(lowercaseQuery) !== -1);
      };
    }
    vm.querySearch = function(query)
    {
      var results = query ? lodash.filter( vm.scripts, vm.createFilterFor(query) ) : vm.scripts;
      return results;
    }
  });

