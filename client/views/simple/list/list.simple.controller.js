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
            '          <md-content class="md-padding" flex>' +
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
            graph_data: vm.scripts[idx].pigList,
            script: vm.scripts[idx]
          },
        });
      };

      vm.openInfo = function(ev, idx, filter_type)
      {
        $mdDialog.show({
          template:
            '<md-dialog flex="80" ng-cloak>'+
            '  <form>' +
            '    <md-toolbar layout="column" class="md-tall">'+
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
            '        <md-button class="md-raised md-primary" ng-disabled="graph_data.length <= 0" ng-click="openGraphInfo($event, script_index)">Show Graph</md-button>' +
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
