'use strict';

angular.module('hog')
.controller('ListComplexCtrl', function ($log, $state, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval, Pig)
    {
      var vm = this;

      vm.isRunning = {};
      vm.running = false;

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
          vm.scripts[idx].output = [];
          //console.log(id);
          var processPercent = 0;

          Runner.run(id)
            .then(
                function(out)
                {
                  //  console.log('OUT '  + out);
                  //   vm.output = out;
                  //     console.log(vm.output);
                },
                function(err)
                {
                  vm.outError = err;
                  //  console.log('OUT '  + err);
                },
                function(update)
                {

                  if (angular.isUndefined(vm.scripts[idx]))
                  {
                    //     console.log(vm.scripts);
                    console.error('Id ',idx,' not found');
                    return;
                  }
                  // console.log(update.type);

                  if (update.type == 'end')
                  {
                    vm.scripts[idx].progress = 100;
                  }
                  else if (update.type == 'progress')
                  {
                    //process status
                    processPercent = percent_data(processPercent);

                    //vm.scripts[idx].progress = update.data;
                    vm.scripts[idx].progress = processPercent;
                  }
                  else if (update.type == 'log')
                  {
                    processPercent = percent_data(processPercent);
                    vm.scripts[idx].progress = processPercent;
                    // console.log('Json: ', update.data.json == null ? "null" : "not null");
                    //console.log(typeof update.data.json);
                    if (update.data.json !== "null")
                    {

                    }
                    else
                    {
                      //  console.log('json is null: ', update.data.json)
                    }
                  }
                  else if (update.type == 'output')
                  {
                    if (update.data.json !== "null")
                    {
                      processPercent = percent_data(processPercent);
                      vm.scripts[idx].progress = processPercent;
                      console.log(update.data.json);
                      vm.scripts[idx].output.push(update.data.json);
                    }
                  }
                });
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


      // Called when Output icon is clicked
      vm.showTabDialog = function(ev, id) {
        //console.log('IN HWEREWR ' , vm.output);

        //   vm.script = {};
        // vm.script.bar = ['sdf'];
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
                + '        <md-tabs  md-selected="mySelection" md-theme="green" md-dynamic-height md-border-bottom>'
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

        console.log('scurvyVM ' + vm.output);
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


}

