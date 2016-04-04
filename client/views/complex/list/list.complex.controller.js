'use strict';

angular.module('hog')
    .controller('ListComplexCtrl', function ($log, $state, Runner, $mdDialog, $mdMedia, $scope,$mdToast,  NgTableParams, $interval)
    {
        var vm = this;
        angular.extend(vm, {
            name: 'ListComplexCtrl',
            scripts: [],
            edit: function(id)
            {
              $state.go('^.edit', {id: id});
            },
            run: function(id, idx)
            {
              var processPercent = 0;
              Runner.run(id)
                .then(
                  function(out)
                  {
                    vm.output = out;
                  },
                  function(err)
                  {
                    vm.outError = err;
                  },
                  function(update)
                  {
                    if (angular.isUndefined(vm.scripts[idx]))
                    {
                      console.log(vm.scripts);
                      console.error('Id ',idx,' not found');
                      return;
                    }
                    console.log(update.type);

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
                      console.log('Json: ', update.data.json == null ? "null" : "not null");
                      console.log(typeof update.data.json);
                      if (update.data.json !== "null")
                      {
                        var parse = JSON.parse(update.data.json);
                        vm.scripts[idx].logs.push(parse[0]);
                        console.log(parse[0]);
                      }
                      else
                      {
                      //  console.log('json is null: ', update.data.json)
                      }
                    }
                    else if (update.type == 'output')
                    {
                      processPercent = percent_data(processPercent);
                      vm.scripts[idx].progress = processPercent;
                      vm.scripts[idx].output.push(update.data.json);
                      //vm.output = update.data;
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
          console.log(currentPer);
          if (currentPer < top)
          {
            currentPer = currentPer + 5
          }
          else
          {
            currentPer = currentPer;
          }
          return currentPer;
        }
        Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              vm.scripts = data.json;
            });


    vm.showTabDialog = function(ev) {
        //$scope.data = pig.output

    $mdDialog.show(
        {
        fullscreen: false,
        targetEvent: ev,
        controller: DialogController,
        template:

'<md-dialog >'+
 ' <form >'+
  '  <md-toolbar >'+
   '   <div class="md-toolbar-tools" >'+
    '    <h2> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Choose a Graph to View Output&emsp;&emsp; &emsp;&emsp;&emsp; &emsp;</h2>'+
     '   <span flex></span>'+
      '  <md-button class="md-icon-button" ng-click="vm.cancel()">'+
       '   <md-icon icon="open_in_new" aria-label="Close dialog"></md-icon>'+
        '</md-button>'+
'      </div>'+
 '   </md-toolbar>'+
  '  <md-dialog-content style="max-width:100%;max-height:100%; ">'+
   '   <md-tabs md-dynamic-height md-border-bottom>'+
    '    <md-tab label="Line">'+
     '     <md-content class="md-padding" >'+

      '       <canvas  class="chart chart-line" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' + 
  
        '  </md-content>'+
'        </md-tab>'+
 '       <md-tab label="Bar">'+
  '        <md-content class="md-padding">'+
         '       <canvas class="chart chart-bar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
'          </md-content>'+
 '       </md-tab>'+
  '      <md-tab class="warn" label="Radar">'+
   '       <md-content class="md-padding">'+
     '   <canvas class="chart chart-radar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
      '   </md-content>'+
       ' </md-tab>'+
'      </md-tabs>'+
 '   </md-dialog-content>'+
'  </form>'+
'</md-dialog>',
     //parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      //      locals: {data: vm.output}
        //}
    })
  };

    });

// Controller for Modal
function DialogController( $mdDialog, $scope, data) {
     $scope.items = [1,2,3];
    $scope.labels= ["Value1", "Value2", "Value3"];
    $scope.series = ['Series A', 'Series B'];
   // $scope.data = data;
    $scope.data = [[1,2,3,],[2,7,1]];
   /* var vm = this;
     console.log('sdfsdf');
  vm.hide = function() {
    $mdDialog.hide();
  };
  vm.cancel = function() {
    $mdDialog.cancel();
  };
  vm.answer = function(answer) {
    $mdDialog.hide(answer);
  };*/
}