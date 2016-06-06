angular.module('hog.hog-templates', [])
.factory('HogTemplates', function()
    {
      /*
       *
       * Controller Templates
       */

      // Controller for Graph Info Modal
      function GraphInfoController($mdDialog, $scope, $timeout, graph_data, script)
      {
        $scope.script_name = script.name;
        $scope.graph_data = graph_data;
        $scope.graph_layout = [];
        $scope.indexs = [];

        $scope.show_graph = false;
        $scope.selectedIndex = 1;

        $scope.x_location = -1;
        $scope.x_axis = -1;
        $scope.y_location = -1;
        $scope.y_axis = 0;

        $scope.sliderNum;
        $scope.graph_type;
        $scope.total_data = {};

        $scope.graph_structure = {};
        $scope.output_selection = $scope.graph_data[0].length;
        $scope.refreshed_data = true;

        function reloadData (cb)
        {

          $scope.graph_structure = {};

          $scope.graph_data.map(function (item)
              {
                if ($scope.graph_structure[item.length])
                {
                  $scope.graph_structure[item.length].push(item);
                }
                else
                {
                  $scope.graph_structure[item.length] = [item];
                }
              });

          /*
           * Set number of outputs to saved setting
           * if it is greater than 0 and less than
           * the number of outputs, else set to
           * number of outputs
           */
          $scope.slider_max = $scope.graph_structure[$scope.output_selection].length;
          $scope.sliderNum = (Number($scope.slider_max) >= Number(script.numOutput) && Number(script.numOutput) > 0) ? script.numOutput : $scope.slider_max;
          $scope.graph_type = (script.bar ? "Bar" : script.line ? "Line" : script.radar ? "Radar" : "Bar");


          if ($scope.refreshed_data)
          {
            $scope.graph_layout = [];
            $scope.indexs = [];

            $scope.graph_structure[$scope.output_selection][0].forEach(function (item, i)
                {
                  $scope.graph_layout.push(i);
                  $scope.indexs.push({value: i, disabled: false});

                  if (i + 1 >= $scope.graph_structure[$scope.output_selection][0].length)
                  {
                    if (cb)
                    {
                      cb();
                    }
                  }
                });

            $scope.refreshed_data = false;
          }


        };

        var myNewChart;
        var ctx;

        $scope.setX = function (x_axis)
        {
          if (x_axis === -1)
          {
            $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
            $scope.x_axis = x_axis;
            $scope.x_location = x_axis;
          }
          else
          {
            $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
            $scope.x_axis = x_axis;
            $scope.indexs.map(function (item, i)
                {
                  if (Number(item.value) === Number($scope.x_axis))
                  {
                    //item.disabled = true;
                    $scope.graph_layout[i] = "X";
                    $scope.x_location = i;

                    if ($scope.y_location >= 0)
                    {
                      $scope.show_graph = true;
                    }
                  }
                });

            if (x_axis === $scope.y_axis)
            {
              $scope.y_axis = -1;
              $scope.y_location = -1;
              $scope.show_graph = false;
            }
          }
        };

        $scope.graphToString = function ()
        {
          return $scope.graph_layout.toString();
        };

        $scope.setY = function (y_axis)
        {
          $scope.graph_layout[$scope.y_axis] = $scope.y_axis;
          $scope.y_axis = y_axis;
          $scope.indexs.map(function (item, i)
              {
                if (Number(item.value) === Number($scope.y_axis))
                {
                  $scope.graph_layout[i] = "Y";
                  $scope.y_location = i;

                  if ($scope.y_location >= 0)
                  {
                    $scope.show_graph = true;
                  }
                }
              });

          if (y_axis === $scope.x_axis)
          {
            $scope.x_axis = -1;
            $scope.x_location = -1;
          }
        };


        $scope.showGraph = function(graph_type)
        {
          if ($scope.y_location != -1)
          {
            if (graph_type)
            {
              $scope.graph_type = graph_type;
            }

            if (myNewChart) {
              myNewChart.destroy();
            }

            var x_data = [];
            var y_data = [];

            $scope.graph_structure[$scope.output_selection].forEach(function (item, i)
                {
                  if ($scope.x_location >= 0)
                  {
                    x_data.push(item[$scope.x_location]);
                  } else {
                    x_data.push(i);
                  }

                  y_data.push(item[$scope.y_location]);

                });


            $scope.total_data = {
              labels: x_data.slice(0, $scope.sliderNum),
              datasets: [{
                labels: x_data.slice(0, $scope.sliderNum),

                // Blue
                fillColor: "rgba(33,150,243,0.3)",
                strokeColor: "rgba(33,150,243,1)",
                pointColor: "rgba(33,150,243,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(33,150,243,1)",

                // Grey
                /*fillColor: "rgba(182,182,182,0.4)",
                  strokeColor: "rgba(182,182,182,1)",
                  pointColor: "rgba(182,182,182,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(182,182,182,1)",*/

                // Orange
                /*fillColor: "rgba(255,87,34,0.3)",
                  strokeColor: "rgba(255,87,34,1)",
                  pointColor: "rgba(255,87,34,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(255,87,34,1)",*/

                data: y_data.slice(0, $scope.sliderNum)
              }]
            };

            var container = document.getElementById("myChart");
            if (container)
            {
              ctx = container.getContext("2d");
              myNewChart = new Chart(ctx)[$scope.graph_type]($scope.total_data);
              myNewChart.resize();
            }
          }

        };

        // wait for data before calling graph
        $timeout(function ()
            {
              $scope.showGraph();
            }, 200);

        $scope.$watch("sliderNum", function ()
            {
              $scope.showGraph();
            });

        $scope.$watch("graph_data", function ()
            {
              reloadData();
            }, true);

        $scope.$watch("output_selection", function ()
            {
              $scope.refreshed_data = true;
              reloadData(function ()
                  {
                    $scope.setY($scope.indexs[0].value);
                    $scope.showGraph();
                  });
            });


        $scope.cancel = function()
        {
          $mdDialog.cancel();
        };

        reloadData(function ()
            {
              $scope.setY($scope.indexs[0].value);
            });
      };



      // Controller for Info Modal
      function InfoController(
          $mdDialog,
          $scope,
          script_name,
          info_outputs,
          outputs,
          logs,
          warnings,
          errors,
          filter_type,
          graph_data,
          openGraphInfo,
          script_index)
      {
        $scope.script_name = script_name;
        $scope.info_outputs = info_outputs;
        $scope.outputs = outputs;
        $scope.logs = logs;
        $scope.warnings = warnings;
        $scope.errors = errors;
        $scope.filter_type = filter_type || "all";

        $scope.graph_data = graph_data;
        $scope.openGraphInfo = openGraphInfo;
        $scope.script_index = script_index;

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

      /*
       *
       * View Templates
       */
      var outputInfoTemplate =
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
        '        <md-button class="md-raised md-primary" ng-disabled="graph_data.length <= 0" ng-click="openGraphInfo($event, script_index)">Show Graph</md-button>' +
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
        '</md-dialog>';

      var graphInfoTemplate =
        '<md-dialog flex="80" ng-cloak>'+
        '  <form>' +
        '    <md-toolbar layout="column" md-scroll-shrink="false">'+
        '      <div flex class="md-toolbar-tools">'+
        '        <h2>Graph Info<span ng-if="script_name"> for {{ script_name }}</span></h2>'+
        '        <span flex></span>'+
        '      </div>'+
        '    </md-toolbar> '+
        '    <md-dialog-content layout="column">'+
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
        '</md-dialog>';

      var complexEditSettingsTemplate =
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
        '</md-dialog>';
      return {
        // Controllers
        GraphInfoController: GraphInfoController,
        InfoController: InfoController,

        // Views
        outputInfoTemplate: outputInfoTemplate,
        graphInfoTemplate: graphInfoTemplate,
        complexEditSettingsTemplate: complexEditSettingsTemplate
      };
    });
