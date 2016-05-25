'use strict';

angular.module('hog')

.controller('EditComplexCtrl', function ($scope, $log, $state, $stateParams, Runner, lodash, Settings, $mdToast,  NgTableParams, $interval, Pig, $mdDialog, PigCompleter)
    {
      var vm = this;
      //vm.script =  Runner.getData();

      var ctx;
      var myNewChart;

      // Graphs are not displayed initially
      vm.outputs = [];
      vm.graph_data = false;
      vm.edited = false;



      vm.taskList = [];
      vm.running = false;

      Pig.on('tracker:update', function (data)
          {
            vm.taskList = data;
          });

      Pig.on('run:finished', function ()
          {
            vm.running = false;
          });

      vm.ots = function (o)
      {
        return JSON.stringify(o);
      }

      // Initialize chart values
      vm.labels = [];
      vm.series = ['Series A'];
      vm.data = [];


      // Inject data from PIG script output to chart
      vm.getData = function(newData)
      {
        var t = JSON.parse(newData);
        vm.data[0] = t;
      };

      var _ = lodash;
      angular.extend(this, {
        name: 'EditComplexCtrl',
        running: false
      });

      Runner.get($stateParams.id)
        .then(
            function(data)
            {
              vm.script = data.json;
              vm.args = vm.script.args.join(" ");

              vm.script_data = vm.script.data;
              $scope.script_data = vm.script_data;

            });

      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.selectedArgs = [];
      vm.editorModel = '';
      vm.progress = 0;

      vm.info_outputs = [];
      vm.logs = [];
      vm.warnings = [];
      vm.errors = [];

      vm.onEditorLoad = function(_ace)
      {
        //_ace.setKeyboardHandler("ace/keyboard/vim");
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          console.log('ace: ', _ace);
          console.log('session: ', _ace.getSession());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        };
        _ace.$blockScrolling = Infinity;
        var langTools = ace.require("ace/ext/language_tools");
        langTools.addCompleter(PigCompleter);
      };
      vm.onEditorChange = function(_ace)
      {

      };
      vm.editorOptions = {
        advanced: {
          enableSnippets: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true
        },
        mode: vm.mode.toLowerCase(),
        onLoad: function(_ace) {vm.onEditorLoad(_ace);},
        useWrapMode: false,
        showGutter: true,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange()
      };
      vm.save = function(graph, numOutput, cb)
      {

        vm.script.name = vm.script.name.replace(/[\s]/g, "_");
        vm.script.data = $scope.script_data;

        console.log('in vm .save', graph);
        vm.script.numOutput = numOutput || vm.script.numOutput;
        vm.script.args = vm.args.split(" ");

        if(graph == 'bar')
        {
          vm.script.bar = true;
          vm.script.line = false;
          vm.script.radar = false;
        }
        if(graph == 'line')
        {
          vm.script.bar = false;
          vm.script.line = true;
          vm.script.radar = false;
        }
        if(graph == 'radar')
        {
          vm.script.bar = false;
          vm.script.line = false;
          vm.script.radar = true;
        }

        Runner.update(vm.script)
          .then(
              function(data)
              {
                $log.debug('saved: ' + data);

                vm.script = data.json;
                vm.args = vm.script.args.join(" ");

                vm.script_data = vm.script.data;
                $scope.script_data = vm.script_data;
                vm.edited = false;


                $mdToast.show(
                  $mdToast.simple()
                  .content('Script Saved!')
                  .hideDelay(3000)
                );
                if (cb)
                {
                  cb();
                }
              },
              function(err)
              {
                $log.error('error: ' +err);
              });
      }
      vm.canceled = function(id) {
        $state.go('home.complex.list');
      }

      vm.saveAndRun = function()
      {
        vm.save(null, null, vm.run);
      };

      vm.saveAndRunAndTrack = function()
      {
        vm.save(null, null, vm.runAndTrack);
      };

      vm.run = function()
      {
        vm.taskList = [];
        // start progress bar
        vm.pigList = [];
        vm.running = true;
        vm.graph_data = false;

        $log.debug('running: ', vm.script._id);

        vm.info_outputs = [];
        vm.outputs = [];
        vm.logs = [];
        vm.warnings = [];
        vm.errors = [];

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
                    vm.info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});

                    vm.parseOutput(update.data.json);
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };
      vm.runAndTrack = function()
      {
        vm.taskList = [];
        vm.outputs = [];
        // start progress bar
        vm.pigList = [];
        vm.running = true;
        vm.graph_data = false;
        vm.errors = [];

        $log.debug('running: ', vm.script._id);
        vm.info_outputs = [];
        vm.logs = [];
        vm.warnings = [];
        Runner.runAndTrack(vm.script._id)
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
                    var tmp_output = "(";
                    for (var i = 0; i < Object.keys(update.data.json).length; i++) {
                      var key = Object.keys(update.data.json)[i];
                      tmp_output += update.data.json[key];
                      if (i + 1 < Object.keys(update.data.json).length) {
                        tmp_output += ", ";
                      }
                    }
                    tmp_output += ")\n";

                    vm.outputs.push(tmp_output);
                    vm.info_outputs.push({data: tmp_output, type: "output", color: {'color': 'green.400'}});
                    vm.parseOutput(tmp_output);
                    vm.graph_data = true;
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };
      vm.exists = function(item, list)
      {
        if(angular.isDefined(list) && angular.isDefined(item))
        {
          return _.findIndex(list, 'arg', item.arg) > -1;
        }
        else
        {
          return false;
        }
      };
      vm.toggle = function(item, list)
      {
        if(angular.isDefined(list) && angular.isDefined(item))
        {
          var idx = _.findIndex(list, 'arg', item.arg);
          if (idx > -1) list.splice(idx, 1);
          else list.push(item);
        }
      };
      vm.index = function(list, item)
      {
        var indx = _.findIndex(list, 'arg', item);
        return indx;
      }

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

      $scope.$watch("script_data", function(newValue, oldValue)
      {
        if (newValue !== vm.script_data)
        {
          vm.edited = true;
        }
        else
        {
          vm.edited = false;
        }

      });

      vm.openGraphInfo = function(ev, graph_data, script)
      {
        $mdDialog.show({
          template:
            '<md-dialog flex="80" ng-cloak>'+
            '  <form>' +
            '    <md-toolbar layout="column" md-scroll-shrink="false">'+
            '      <div flex class="md-toolbar-tools">'+
            '        <h2>Graph Info<span ng-if="script_name"> for {{ script_name }}</span></h2>'+
            '        <span flex></span>'+
            '      </div>'+
            '    </md-toolbar> '+
            '    <md-dialog-content layout="column" scroll-glue>'+
            '      <md-tabs class="md-primary" md-dynamic-height md-border-bottom md-selected="selectedIndex" md-autoselect>' +
            '        <md-tab label="Settings">' +
            '          <md-content class="md-padding">' +
            '            <div flex layout="column" layou-padding>' +
            '              <md-input-container>' +
            '                <label>Output with #</label>' +
            '                <md-select ng-model="output_selection">' +
            '                  <md-option ng-repeat="(key, value) in graph_structure" value="{{ key }}">' +
            '                    {{ key }}' +
            '                  </md-option>' +
            '                </md-select>' +
            '              </md-input-container>' +
            '            </div>' +
            '            <div flex layout="row" layout-padding>' +
            '              <div flex>' +
            '                <md-subheader class="md-primary">Data layout</md-subheader>' +
            '                <div layout="row">' +
            '                  [<span ng-repeat="item in graph_layout track by $index"><span ng-if="!$first"> </span>{{ item }}<span ng-if="!$last">,</span></span> ]' +
            '                </div>' +
            '              </div>' +
            '            </div>' +
            '            <md-divider ></md-divider>' +
            '            <div flex layout="row" layout-padding>' +
            '              <div flex>' +
            '                <md-menu>' +
            '                  <md-button flex class="md-raised" aria-label="X Axis" ng-click="$mdOpenMenu($event)">' +
            '                    X Axis' +
            '                  </md-button>' +
            '                  <md-menu-content width="6">' +
            '                    <md-menu-item>' +
            '                      <md-button ng-click="setX(-1)">' +
            '                        Index' +
            '                      </md-button>' +
            '                    </md-menu-item>' +
            '                    <md-menu-item ng-repeat="item in indexs">' +
            '                      <md-button ng-disabled="item.disabled" ng-click="setX($index)">' +
            '                        {{ item.value }}' +
            '                      </md-button>' +
            '                    </md-menu-item>' +
            '                  </md-menu-content>' +
            '                </md-menu>' +
            '              </div>' +
            '              <div flex>' +
            '                <md-menu>' +
            '                  <md-button flex class="md-raised" aria-label="Y Axis" ng-click="$mdOpenMenu($event)">' +
            '                    Y Axis' +
            '                  </md-button>' +
            '                  <md-menu-content width="6">' +
            '                    <md-menu-item ng-repeat="item in indexs">' +
            '                      <md-button ng-disabled="item.disabled" ng-click="setY($index)">' +
            '                        {{ item.value }}' +
            '                      </md-button>' +
            '                    </md-menu-item>' +
            '                  </md-menu-content>' +
            '                </md-menu>' +
            '              </div>' +
            '            </div>' +
            '          </md-content>' +
            '        </md-tab>' +
            '        <md-tab label="Graph" ng-disabled="!show_graph" ng-click="showGraph()">' +
            '          <md-toolbar md-scroll-shrink="false">' +
            '            <div class="md-toolbar-tools">' +
            '              <md-button class="md-primary md-raised" ng-click="showGraph(\'Bar\')">' +
            '                Bar Graph' +
            '              </md-button>' +
            '              <md-button class="md-primary md-raised" ng-click="showGraph(\'Line\')">' +
            '                Line Graph' +
            '              </md-button>' +
            '              <md-button class="md-primary md-raised" ng-click="showGraph(\'Radar\')">' +
            '                Radar Graph' +
            '              </md-button>' +
            '            </div>' +
            '          </md-toolbar>' +
            '          <div layout-padding flex>' +
            '            <md-input-container>' +
            '              <label>Output with #</label>' +
            '              <md-select ng-model="output_selection">' +
            '                <md-option ng-repeat="(key, value) in graph_structure" value="{{ key }}">' +
            '                  {{ key }}' +
            '                </md-option>' +
            '              </md-select>' +
            '            </md-input-container>' +
            '          </div>' +
            '          <md-content class="md-padding">' +
            '            <canvas class="chart chart-bar" id="myChart" chart-legend="true"></canvas>' +
            '          </md-content>' +
            '          <div layout-padding flex>' +
            '            <br/>' +
            '            <br/>' +
            '            <md-slider md-discrete ng-model="sliderNum" min="0" max="{{ slider_max }}" aria-label="blue" id="blue-slider" class="md-primary"></md-slider>' +
            '          </div>' +
            '        </md-tab>' +
            '      </md-tabs>' +
            '      <md-divider ></md-divider>' +
            '    </md-dialog-content>'+
            '    <div class="md-actions" layout="row" layout-align="end center">' +
            '      <md-button class="md-raised" ng-click="cancel()">Close</md-button>' +
            '    </div>' +
            '  </form>' +
            '</md-dialog>',
          controller: GraphInfoController,
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
          template:
            '<md-dialog flex="80" ng-cloak>'+
            '  <form>' +
            '    <md-toolbar layout="column" class="md-tall">' +
            '      <div flex class="md-toolbar-tools">'+
            '        <h2>Info<span ng-if="script_name"> for {{ script_name }}</span></h2>'+
            '        <span flex></span>'+
            '      </div>'+
            '      <div class="md-toolbar-tools" layout="row" layout-sm="column" flex layout-align="start center">' +
            '        <md-button class="md-raised md-primary" ng-disabled="info_outputs.length <= 0" ng-click="filterByAll()">Show All</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="outputs.length <= 0" ng-click="filterByOutput()">Show Outputs</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="logs.length <= 0" ng-click="filterByLog()">Show Logs</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="warnings.length <= 0" ng-click="filterByWarning()">Show Warnings</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="errors.length <= 0" ng-click="filterByError()">Show Errors</md-button>' +
            '        <md-button class="md-raised md-primary" ng-disabled="graph_data.length <= 0" ng-click="openGraphInfo($event)">Show Graph</md-button>' +
            '      </div>' +
            '    </md-toolbar> '+
            '    <md-dialog-content scroll-glue>'+
            '      <md-content flex layout-padding>' +
            '        <md-list>' +
            '          <md-list-item ng-repeat="data in filteredInfo()">' +
            '            <span md-style-color="data.color">{{ data.data }}</span>' +
            '          </md-list-item>' +
            '        </md-list>' +
            '      </md-content>' +
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


      vm.openSettings = function(ev)
      {

        $mdDialog.show({
          controller: SettingsController,
          template:
            '<md-dialog ng-cloak>'+
            '  <form>'+
            '    <md-toolbar>'+
            '      <div class="md-toolbar-tools">'+
            '        <h2>Graph Settings</h2>'+
            '        <span flex></span>'+
            '      </div>'+
            '    </md-toolbar>'+
            '    <md-dialog-content>'+
            '      <div class="md-dialog-content">'+
            '        <legend>How would you like to view your output?</legend>'+
            '        <div layout="column" layout-align="center start">'+
            '          <md-checkbox ng-disabled="vm.script.line || vm.script.radar"  ng-model="vm.script.bar" >'+
            '            Bar Graph '+
            '          </md-checkbox>'+
            '          <md-checkbox ng-disabled="vm.script.bar || vm.script.radar"  ng-model="vm.script.line" >'+
            '            Line Graph '+
            '          </md-checkbox>'+
            '          <md-checkbox ng-disabled="vm.script.bar || vm.script.line"  ng-model="vm.script.radar">'+
            '            Radar Graph'+
            '          </md-checkbox>'+
            '        </div>'+
            '      </div>'+
            '      <md-input-container class="md-block">'+
            '        <div required > ' +
            '          <label>Enter the number of desired outputs</label>'+
            '          <input ng-model="vm.script.numOutput">'+
            '        </div>'+
            '      </md-input-container>'+
            '      <md-button class="md-raised md-primary" ng-click="cancel()">Close</md-button>' +
            '      <md-button class="md-raised md-primary" ng-click="save(vm.script)">Save</md-button>' +
            '     </md-dialog-content>'+
            '  </form>'+
            '</md-dialog>',
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals:{vm:vm},

        });

      }

    });


// Controller for Settings Modal
function SettingsController( $mdDialog, $scope, vm)
{
  $scope.vm = vm;
  $scope.cancel = function()
  {
    $mdDialog.cancel();
  };
  $scope.save = function(script)
  {
    if(script.bar == true)
    {
      $scope.vm.save('bar', script.numOutput);
    }
    if(script.line == true)
    {
      $scope.vm.save('line', script.numOutput);
    }
    if(script.radar == true)
    {
      $scope.vm.save('radar', script.numOutput);
    }
    $scope.cancel();
  }
};
