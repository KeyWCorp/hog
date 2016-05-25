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

    });
