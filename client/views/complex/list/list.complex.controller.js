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
                          
                     //   console.log(JSON.stringify(update.data.json));
                      //    console.log(update.data.json)
                     //     var parse = JSON.parse(update.data.json);
                       // vm.scripts[idx].logs.push(parse[0]);
                        //console.log(parse[0]);
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
                        console.log(update.data.json);
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
  '<div layout="column" flex="50%">'+
'<md-dialog flex="60%">'+
 ' <form >'+
  '  <md-toolbar >'+
          
   '   <div class="md-toolbar-tools" flex>'+
    '    <h2> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Choose a Graph to View Output&emsp;&emsp; &emsp;&emsp;&emsp; &emsp;</h2>'+
    // '   <span flex></span>'+
      '  <md-button class="md-icon-button" ng-click="vm.cancel()">'+
       '   <md-icon icon="open_in_new" aria-label="Close dialog"></md-icon>'+
        '</md-button>'+
'      </div>'+
         
            '   </md-toolbar>'+
              '<div flex>'+
  '  <md-dialog-content >'+
   '   <md-tabs  md-selected="mySelection" md-theme="green" md-dynamic-height md-border-bottom>'+
    
 '       <md-tab  label="Bar">'+
  '        <md-content class="md-padding">'+
         '       <canvas class="chart chart-bar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
'          </md-content>'+
 '       </md-tab>'+
            '    <md-tab label="Line">'+
     '     <md-content class="md-padding" >'+
      '       <canvas  class="chart chart-line" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' + 
  
        '  </md-content>'+
'        </md-tab>'+
  '      <md-tab label="Radar">'+
   '       <md-content class="md-padding">'+
     '   <canvas class="chart chart-radar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
      '   </md-content>'+
       ' </md-tab>'+
'      </md-tabs>'+
 '   </md-dialog-content>'+
          '</div>'+
'  </form>'+
            ' <div layout layout-align="center center" flex>' + 
    '  <span class="md-body-1">Number of Outputs</span>' + 
   '   </div>' + 
   // '  <md-slider md-discrete flex min="0" max="255" ng-model="sliderNum" aria-label="red" id="red-slider" class>'+ 
     //' </md-slider>'+
            //'<div flex="20" layout layout-align="center center">'+
            '<div flex>'+
        '<input flex type="number" min="0" ng-model="sliderNum" aria-label="red" ng-click="slider()" aria-controls="red-slider">'+
      '</div>'+
   // '</div>'+
'</md-dialog>'+
            '</div>',
     parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
            locals: {data: vm.output, vm:vm, id:id}
        
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
    $scope.labels= ["19.0.9.1", "65.22.8.1", "130.57.2.4","129.79.1.8","128.59.1.1", "131.11.43.1", "444.11.2.4","646.34.3.1"];
    $scope.series = ['Series A'];
    $scope.data = [[]];
    $scope.mySelection = {};
    $scope.tempScript = {};
    $scope.tempData = [[[0.64],[0.074285716],[0.0670727],[0.059859693],[0.05745536],[0.4323456],[0.0987654],[0.123564]]];
    
$scope.vm = vm;
    $scope.sliderNum = 0;
    
    console.log(vm.scripts);
    console.log(id);
    
    
    for(var i = 0; i < vm.scripts.length; i++)
    {
        if(vm.scripts[i].id == id)
        {
            $scope.tempScript = vm.scripts[i];
        }
    }
    
    
    var numOutput = parseInt($scope.tempScript.numOutput);
    $scope.sliderNum = numOutput;
  // for(var j = 0; j < $scope.sliderNum; j++)
//    {
  //      $scope.data[0].push($scope.tempData[0][j]);
//    }
    
    $scope.$watch(
    function() {
        
        return $scope.sliderNum;
    },
    function() {
        $scope.data[0] = [[]];
       for(var j = 0; j < $scope.sliderNum; j++)
    {
        
        $scope.data[0].push($scope.tempData[0][j]);
        console.log($scope.data[0]);
    }
    });
    
    if($scope.tempScript.bar == true){$scope.mySelection = 0}
    if($scope.tempScript.line == true){$scope.mySelection = 1}
    if($scope.tempScript.radar == true){$scope.mySelection = 2}
    
   
}

