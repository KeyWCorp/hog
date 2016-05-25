'use strict';

angular.module('hog')
.controller('ListComplexCtrl', function ($log, $state, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval, Pig)
    {
      var vm = this;

      vm.isRunning = {};
      vm.running = false;

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

      Pig.on('run:finished', function ()
          {
            vm.running = false;
          });

      angular.extend(vm, {
        name: 'ListComplexCtrl',
        scripts: [],
        edit: function(id)
        {
          $state.go('^.edit', {id: id});

        },
        run: function(id, idx)
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

        }

      });
      // Percent Data figures out the percentage to place
      // keep percent lower than 100%
      function percent_data (current)
      {
        var currentPer = current;
        var top = 95;
        //console.log(currentPer);
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
              //  console.log(data.json);
              // console.log(vm.scripts);
            });

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

      // Called when Output icon is clicked
      vm.showTabDialog = function(ev, id) {
        console.log(id);

        $mdDialog.show(
            {
              fullscreen: false,
              //targetEvent: ev,
              controller: DialogController,
              template:
                  '<md-dialog flex="60" layout="column">'
                + '  <form >'
                + '    <md-toolbar>'
                + '      <div class="md-toolbar-tools">'
                + '        <h2> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Choose a Graph to View Output&emsp;&emsp; &emsp;&emsp;&emsp; &emsp;</h2>'
                + '        <md-button class="md-icon-button" ng-click="vm.cancel()">'
                + '          <md-icon icon="open_in_new" aria-label="Close dialog"></md-icon>'
                + '        </md-button>'
                + '      </div>'
                + '    </md-toolbar>'
                + '    <div>'
                + '      <md-dialog-content >'
                + '        <md-tabs  md-selected="mySelection" class="md-primary" md-theme="green" md-dynamic-height md-border-bottom>'
                + '          <md-tab  label="Bar">'
                + '            <md-content class="md-padding">'
                + '              <canvas class="chart chart-bar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series">'
                + '              </canvas>'
                + '            </md-content>'
                + '          </md-tab>'
                + '          <md-tab label="Line">'
                + '            <md-content class="md-padding" >'
                + '              <canvas  class="chart chart-line" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series">'
                + '              </canvas>'
                + '            </md-content>'
                + '          </md-tab>'
                + '          <md-tab label="Radar">'
                + '            <md-content class="md-padding">'
                + '              <canvas class="chart chart-radar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series">'
                + '              </canvas>'
                + '            </md-content>'
                + '          </md-tab>'
                + '        </md-tabs>'
                + '        <div layout-padding>'
                + '          <md-slider md-discrete ng-model="sliderNum" min="0" max="{{ output.length }}" aria-label="blue" id="blue-slider" class="md-primary"></md-slider>'
                + '        </div>'
                + '      </md-dialog-content>'
                + '    </div>'
                + '  </form>'
                + '</md-dialog>',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              locals: {vm:vm, id:id}

            })

      };




      // * Create filter function for a query string

      function createFilterFor(query)
      {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state)
        {
          return (state.value.indexOf(lowercaseQuery) === 0);
        };
      }




    });

// Controller for Modal
// inject data into here

//I removed data from the controller directives
function DialogController( $mdDialog, $scope, Runner, vm, id) {
  $scope.items = [1,2,3];

  $scope.series = ['Series A'];
  $scope.mySelection = {};

  $scope.labels = [];
  $scope.data = [];

  $scope.vm = vm;

  console.log(vm.scripts);
  console.log(id);

  $scope.tempScript = vm.scripts.filter(function (script)
  {
    if (script._id === id)
    {
      return script;
    }
  })[0];
  console.log("DATA: " + JSON.stringify($scope.data, null, 2));

  $scope.output = $scope.tempScript.output;
  $scope.outputData = [];
  $scope.outputLabels = [];
  $scope.output.map(function (o)
  {
    $scope.outputLabels.push(o[Object.keys(o)[0]]);
    $scope.outputData.push(o[Object.keys(o)[1]]);
  });


  $scope.sliderNum = ($scope.output.length >= 4) ? 4 : $scope.output.length;
  $scope.data = $scope.outputData.slice(0, $scope.sliderNum);
  $scope.labels = $scope.outputLabels.slice(0, $scope.sliderNum);
  console.log("OUTPUT: " + $scope.outputData);


  $scope.$watch(
      function() {
        return $scope.sliderNum;
      },
      function() {
        $scope.data = [];
        $scope.labels = [];
        $scope.labels = $scope.outputLabels.slice(0, $scope.sliderNum);
        $scope.data.push($scope.outputData.slice(0, $scope.sliderNum));
      });

  if($scope.tempScript.bar == true){$scope.mySelection = 0}
  if($scope.tempScript.line == true){$scope.mySelection = 1}
  if($scope.tempScript.radar == true){$scope.mySelection = 2}


};
