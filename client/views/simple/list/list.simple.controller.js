'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $scope, $state, Runner, Pig, $mdDialog)
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

      vm.edit = function(id)
      {
        $state.go('^.edit', {id: id});
      };

      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };

      vm.openInfo = function(ev, idx, filter_type)
      {
        $mdDialog.show({
          template:
            '<md-dialog flex="80" ng-cloak>'+
            '  <form>' +
            '    <md-toolbar layout="column">'+
            '      <div flex class="md-toolbar-tools">'+
            '        <h2>Info<span ng-if="script_name"> for {{ script_name }}</span></h2>'+
            '        <span flex></span>'+
            '      </div>'+
            '    </md-toolbar> '+
            '    <md-toolbar>' +
            '      <div flex class="md-toolbar">' +
            '        <md-button class="md-raised md-primary" ng-disabled="info_outputs.length <= 0" ng-click="filterByAll()">Show All</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="outputs.length <= 0" ng-click="filterByOutput()">Show Outputs</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="logs.length <= 0" ng-click="filterByLog()">Show Logs</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="warnings.length <= 0" ng-click="filterByWarning()">Show Warnings</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="errors.length <= 0" ng-click="filterByError()">Show Errors</md-button>' +
            '      </div>' +
            '    </md-toolbar> '+
            '    <md-dialog-content scroll-glue>'+
            '      <div class="md-dialog-content">' +
            '        <md-content flex layout-padding>' +
            '          <md-list>' +
            '            <md-list-item ng-repeat="data in filteredInfo()">' +
            '              <span md-style-color="data.color">{{ data.data }}</span>' +
            '            </md-list-item>' +
            '          </md-list>' +
            '        </md-content>' +
            '      </div>' +
            '      <md-divider ></md-divider>' +
            '    </md-dialog-content>'+
            '    <div class="md-actions" layout="row" layout-align="end center">' +
            '      <md-button class="md-raised" ng-click="cancel()">Close</md-button>' +
            '    </div>' +
            '  </form>' +
            '</md-dialog>',
          controller: InfoController,
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
            filter_type: filter_type
          },
        });
      };

      angular.extend(vm, {
        name: 'ListSimpleCtrl',
      });
    });



// Controller for Info Modal
function InfoController( $mdDialog, $scope, script_name, info_outputs, outputs, logs, warnings, errors, filter_type)
{
  $scope.script_name = script_name;
  $scope.info_outputs = info_outputs;
  $scope.outputs = outputs;
  $scope.logs = logs;
  $scope.warnings = warnings;
  $scope.errors = errors;
  $scope.filter_type = filter_type || "all";

  console.log("NAME: " + $scope.script_name);

  $scope.filteredInfo = function ()
  {
    return $scope.info_outputs.filter(function (info)
    {
      if ($scope.filter_type === "all")
      {
        return true;
      } else
      {
        return info.type === $scope.filter_type;
      }
    });
  };

  $scope.filterByAll = function ()
  {
    $scope.filter_type = "all";
  };

  $scope.filterByOutput = function ()
  {
    $scope.filter_type = "output";
  };

  $scope.filterByLog = function ()
  {
    $scope.filter_type = "log";
  };

  $scope.filterByWarning = function ()
  {
    $scope.filter_type = "warning";
  };

  $scope.filterByError = function ()
  {
    $scope.filter_type = "error";
  };

  $scope.cancel = function()
  {
    $mdDialog.cancel();
  };
};
