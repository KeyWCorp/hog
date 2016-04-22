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
               //       console.log('OUT '  + out);
                    vm.output = out;
                 //     console.log(vm.output);
                  },
                  function(err)
                  {
                    vm.outError = err;
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
                        var parse = JSON.parse(update.data.json);
                        vm.scripts[idx].logs.push(parse[0]);
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
        Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              vm.scripts = data.json;
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
   '   <md-tabs  md-dynamic-height md-border-bottom>'+
    '    <md-tab  ng-disabled="tempScript.bar || tempScript.radar" label="Line">'+
     '     <md-content class="md-padding" >'+
      '       <canvas  class="chart chart-line" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' + 
  
        '  </md-content>'+
'        </md-tab>'+
 '       <md-tab ng-disabled="tempScript.line || tempScript.radar" label="Bar">'+
  '        <md-content class="md-padding">'+
         '       <canvas class="chart chart-bar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
'          </md-content>'+
 '       </md-tab>'+
  '      <md-tab ng-disabled="tempScript.bar || tempScript.line" label="Radar">'+
   '       <md-content class="md-padding">'+
     '   <canvas class="chart chart-radar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
                '</canvas>' +
      '   </md-content>'+
       ' </md-tab>'+
'      </md-tabs>'+
 '   </md-dialog-content>'+
'  </form>'+
'</md-dialog>',
     parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
            locals: {data: vm.output, vm:vm, id:id}
        
    })
      
    console.log('scurvyVM ' + vm.output);
  };

    
    
    vm.simulateQuery = false;
    vm.isDisabled = false;
    // list of `state` value/display objects
    vm.states = loadAll();
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    // vm.newState = newState;

    // ******************************
    // Internal methods
    // ******************************
    
    // * Search for states... use $timeout to simulate
     //* remote dataservice call.
     
    function querySearch(query)
    {
      var results = query ? vm.states.filter(createFilterFor(query)) : vm.states,
        deferred;
      if (vm.simulateQuery)
      {
        deferred = $q.defer();
        $timeout(function ()
        {
          deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
      }
      else
      {
        return results;
      }
    }

    function searchTextChange(text)
    {
      $log.info('Text changed to ' + text);
      //console.log('anything?');
    }

    function selectedItemChange(item)
    {
      $log.info('Item changed to ' + JSON.stringify(item));
        vm.scripts = item;
        console.log(vm.scripts);
    }
    
    // * Build `states` list of key/value pairs
    
   
    function loadAll()
    {
        var allStates = [];
        var temp = '';
   //  Runner.list()
     //   .then(
       // function(data)
    //  {
      // Might Need to Parse it
      //  vm.script = data.json;
         // console.log(vm.script[0].name);

      // console.log(Runner.run());
        //  for(var i = 0; i < vm.script.length; i++)
        //  {
          //    allStates.push(vm.script[i].name);
          //}

         //temp = allStates.join(", ")
         ///console.log(temp);
          //return temp;
      var t = 'Steve_Test, Kevin_Test, Scurvyyy, toss mags, DOES THIS WORK';
        
        // var temp = 'test1'
          console.log(temp);
                //return 'test';
      return t.split(/, +/g).map( function (state) {
      return {
      value: state.toLowerCase(),
      display: state
      };
       });
      //});
    }
    
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
    $scope.labels= ["193.0.9.1", "65.22.8.1", "130.57.2.4","129.79.1.8","128.59.1.1"];
    $scope.series = ['Series A'];
    $scope.data = [[]];
    $scope.tempData = [[[0.647934],[0.074285716],[0.0670727],[0.059859693],[0.05745536]]];
    
$scope.vm = vm;
    //console.log(vm.scripts.numOutput)
   // console.log('VM IS ' + JSON.stringify(vm.scripts[0]));
    $scope.tempScript = {};
    
    for(var i = 0; i < vm.scripts.length; i++)
    {
       // console.log(vm.scripts[i].id)
        if(vm.scripts[i].id == id)
        {
            $scope.tempScript = vm.scripts[i];
        }
        //console.log(id);
    }
   // console.log(parseInt($scope.tempScript.numOutput));
    var r = parseInt($scope.tempScript.numOutput);
   for(var j = 0; j < r; j++)
    {
       // console.log($scope.tempData[0][0]);
        $scope.data[0].push($scope.tempData[0][j]);
    }
   // console.log($scope.tempScript);
    console.log($scope.data);
  /*  Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              $scope.vm.Scurvy = data.json;
               console.log($scope.vm.Scurvy)
               /* console.log($scope.scripts[2].bar);
                console.log($scope.scripts[2].line);
                console.log($scope.scripts[2].radar)
          });*/
  ///  console.log('SCURVY' + JSON.stringify($scope.vm));
    //$scope.data = [[1,2,3,],[2,7,1]];
  /*  var vm = this;
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

/*'use strict';

angular.module('hog')
  .controller('ListComplexCtrl', function ($log, $state, Runner, $mdDialog, $mdMedia, $scope, $mdToast, NgTableParams, $interval)
  {
    var vm = this;
    vm.script = {};
    /* vm.script =  Runner.getData()
   
         .then(
             function(data)
             {
                 
             }
             );
     //console.log((vm.script['$$state']));*/
    /* Runner.list()
           .then(
             function(data)
             {
               // Might Need to Parse it
               vm.script = data.json;
           //      console.log(JSON.stringify(vm.script));
             });*/
   /* angular.extend(vm,
    {
      name: 'ListComplexCtrl',
      scripts: [],
      edit: function (id)
      {
        $state.go('^.edit',
        {
          id: id
        });
      },
      run: function (id, idx)
      {
        var processPercent = 0;
        Runner.run(id)
          .then(
            function (out)
            {
              console.log('OUT ' + out);
              vm.output = out;
              console.log('ANYTHING ' + vm.output);
            },
            function (err)
            {
              vm.outError = err;
            },
            function (update)
            {
              if (angular.isUndefined(vm.scripts[idx]))
              {
                    console.log('AA' + vm.scripts);
                console.error('Id ', idx, ' not found');
                return;
              }
              // console.log(update.type);

              if (update.type == 'end')
              {
                vm.scripts[idx].progress = 100;
                  console.log('SDF' + vm.scripts);
              }
              else if (update.type == 'progress')
              {
                //process status
                processPercent = percent_data(processPercent);

                //vm.scripts[idx].progress = update.data;
                vm.scripts[idx].progress = processPercent;
                  console.log('ppp' + vm.scripts);
              }
              else if (update.type == 'log')
              {
                processPercent = percent_data(processPercent);
                vm.scripts[idx].progress = processPercent;
                  console.log('ppp' + vm.scripts);
                // console.log('Json: ', update.data.json == null ? "null" : "not null");
                //console.log(typeof update.data.json);
                if (update.data.json !== "null")
                {
                  //  console.log(update.data.json);
                    var parse = JSON.parse(update.data.json);
                  vm.scripts[idx].logs.push(parse[0]);
                    console.log('ppp' + vm.scripts);
                  //console.log('PARSE '+ parse);
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
                  console.log('ppp' + vm.scripts);
                //vm.output = update.data;
              }
            });
      }
    });
    // Percent Data figures out the percentage to place
    // keep percent lower than 100%
    function percent_data(current)
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

    /*  Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              vm.script = data.json;
                console.log(vm.script);
            });
*/


    //$scope.items = ["script 1","script 2","script 3","script 4"];
    //   $scope.selectedItem;
    // / $scope.getSelectedText = function() {
    //   if ($scope.selectedItem !== undefined) {
    //     return  $scope.selectedItem;
    //    } else {
    //return "Please select an item";
    //    }
    //  };


/*
    vm.showTabDialog = function (ev)
    {
      //$scope.data = pig.output
      console.log('IN showTabDialog Function in list controller');
      console.log(JSON.stringify(script));
      console.log('bar = ' + script.bar);
      console.log('line = ' + script.line);
      console.log('radar = ' + script.radar);

      $mdDialog.show(
        {
          fullscreen: false,
          controller: DialogController,
          template:

            '<md-dialog >' +
            ' <form >' +
            '  <md-toolbar >' +
            '   <div class="md-toolbar-tools" >' +
            '    <h2> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Choose a Graph to View Output&emsp;&emsp; &emsp;&emsp;&emsp; &emsp;</h2>' +
            '   <span flex></span>' +
            '  <md-button class="md-icon-button" ng-click="vm.cancel()">' +
            '   <md-icon icon="open_in_new" aria-label="Close dialog"></md-icon>' +
            '</md-button>' +
            '      </div>' +
            '   </md-toolbar>' +
            '  <md-dialog-content style="max-width:100%;max-height:100%; ">' +
            '   <md-tabs md-dynamic-height md-border-bottom>' +
            '    <md-tab ng-disabled="vm.script.bar || vm.script.radar" label="Line">' +
            '     <md-content class="md-padding" >' +

            '       <canvas class="chart chart-line" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
            '</canvas>' +

            '  </md-content>' +
            '        </md-tab>' +
            '       <md-tab ng-disabled="vm.script.radar || vm.script.line" label="Bar">' +
            '        <md-content class="md-padding">' +
            '       <canvas class="chart chart-bar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
            '</canvas>' +
            '          </md-content>' +
            '       </md-tab>' +
            '      <md-tab ng-disabled="vm.script.bar || vm.script.line" class="warn" label="Radar">' +
            '       <md-content class="md-padding">' +
            '   <canvas class="chart chart-radar" chart-data="data" chart-labels="labels"   chart-legend="true" chart-series="series"> ' +
            '</canvas>' +
            '   </md-content>' +
            ' </md-tab>' +
            '      </md-tabs>' +
            '   </md-dialog-content>' +
            '  </form>' +
            '</md-dialog>',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals:
          {
            data: vm.output,
            vm: vm
          }

        })
        //console.log('scurvyVM ' + vm.output);
    };




/*

    vm.simulateQuery = false;
    vm.isDisabled = false;
    // list of `state` value/display objects
    vm.states = loadAll();
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    // vm.newState = newState;

    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     
    function querySearch(query)
    {
      var results = query ? vm.states.filter(createFilterFor(query)) : vm.states,
        deferred;
      if (vm.simulateQuery)
      {
        deferred = $q.defer();
        $timeout(function ()
        {
          deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
      }
      else
      {
        return results;
      }
    }

    function searchTextChange(text)
    {
      $log.info('Text changed to ' + text);
      //console.log('anything?');
    }

    function selectedItemChange(item)
    {
      $log.info('Item changed to ' + JSON.stringify(item));
    }
    /**
     * Build `states` list of key/value pairs
     
    function loadAll()
    {
      // Runner.list()
      //  .then(
      //  function(data)
      //{
      // Might Need to Parse it
      //  vm.script = data.json;
      //    console.log(vm.script);

      // console.log(Runner.run());

      //   var allStates = vm.script[0].name;
      //          return allStates;
      //return allStates.split(/, +/g).map( function (state) {
      //return {
      //value: state.toLowerCase(),
      //display: state
      //};
      // });
      //  });
    }
    /**
     * Create filter function for a query string
     
    function createFilterFor(query)
    {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state)
      {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }


*/




/*

  });









// Controller for Modal
// inject data into here
function DialogController($mdDialog, $scope, data, vm)
{
  $scope.vm = vm;
  $scope.items = [1, 2, 3];
  $scope.labels = ["193.0.9.1", "65.22.8.1", "130.57.2.4", "129.79.1.8", "128.59.1.1"];
  $scope.series = ['Series A'];
  // $scope.data = data;
  $scope.data = [
    [
      [0.647934],
      [0.074285716],
      [0.0670727],
      [0.059859693],
      [0.05745536]
    ]
  ];


  console.log('SCURVY' + JSON.stringify($scope.data, null, 4));

}

/*'<md-dialog >'+
 ' <form >'+
  '  <md-toolbar >'+
            '<h2> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Choose a Graph to View Output&emsp;&emsp; &emsp;&emsp;&emsp; &emsp;</h2>'+
'<input type="checkbox" name="vehicle" value="Bike">Bar Graph<br>'+
'<input type="checkbox" name="vehicle" value="Car">Line Graph '+
'<input type="checkbox" name="vehicle" value="Car">Radar Graph '+
'</form>'+
           '</md-dialog>',

*/