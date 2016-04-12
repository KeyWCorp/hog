'use strict';

angular.module('hog')
    .controller('EditComplexCtrl', function ($log, $state,$stateParams, Runner, lodash, Settings, $mdToast,  NgTableParams, $interval, $mdDialog)
    {


    var vm = this;

    var ctx;
    var myNewChart;

    // Graphs are not displayed initially
    vm.showGraph = false;
    vm.showLine = false;
    vm.bar = false;
    vm.radar = false;
    vm.pie = false;
    vm.output = [];

    // Initialize chart values
    vm.labels = [];
    vm.series = ['Series A'];
    vm.data = [];

    // Progress Bar Variables
    vm.start = false;


    // Inject data from PIG script output to chart
    vm.getData = function(newData)
        {
            //console.log(JSON.parse(newData));
            var t = JSON.parse(newData);
            //console.log(t);
            vm.data[0] = t;
        };

    // Display the Bar Graph
    vm.showBarGraph = function()
        {
            if (myNewChart) {
                myNewChart.destroy();
            }

            vm.showGraph = true;
            ctx = document.getElementById("myChart").getContext("2d");

            //vm.bar = true;
            //vm.pie = false;
            //vm.showLine = false;
            //vm.radar = false;
            myNewChart = new Chart(ctx).Bar(vm.total_data);
            myNewChart.resize();
        };

    // Display the Radar Chart
    vm.showRadarChart = function()
        {
            if (myNewChart) {
                myNewChart.destroy();
            }

            vm.showGraph = true;
            ctx = document.getElementById("myChart").getContext("2d");

            //vm.bar = false;
            //vm.pie = false;
            //vm.showLine = false;
            //vm.radar = true;
            myNewChart = new Chart(ctx).Radar(vm.total_data);
            myNewChart.resize();
        };

    // Display the Line Graph
    vm.showLineGraph = function()
        {
            if (myNewChart) {
                myNewChart.destroy();
            }

            vm.showGraph = true;
            ctx = document.getElementById("myChart").getContext("2d");

            //vm.showLine = true;
            //vm.pie = false;
            //vm.bar = false;
            //vm.radar = false;
            myNewChart = new Chart(ctx).Line(vm.total_data);
            myNewChart.resize();
        };
      // Display the Pie Graph
    vm.showLPieChart = function()
        {
            if (myNewChart) {
                myNewChart.destroy();
            }

            vm.showGraph = true;
            ctx = document.getElementById("myChart").getContext("2d");

            //vm.pie = true;
            //vm.showLine = false;
            //vm.bar = false;
            //vm.radar = false;
            //vm.pidata = [1,2,3];
            myNewChart = new Chart(ctx).Pie(vm.total_data);
            myNewChart.resize();
        };

    // User selects values from table,
    // set vm.data equal to the changes
    vm.onChange = function()
    {

        vm.data = [[]];
        vm.labels = [];

	var keys = Object.keys(vm.testData[0]);
	keys = keys.slice(0, keys.length - 1);

	for (var i = 0; i < vm.testData.length; i++) {
            var data = vm.testData[i];
            vm.labels.push(data[keys[0]]);
            vm.data[0].push(parseFloat(data[keys[1]]));
        };

        if (myNewChart) {
            myNewChart.destroy();
        }

       vm.total_data = {
            labels: vm.labels,
            datasets: [
                {
                    labels: "kevins",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: vm.data[0]
                }
            ]
       };
        vm.showGraph = true;

    };

        var _ = lodash;
        console.log(Settings);
        angular.extend(this, {
          name: 'EditComplexCtrl',
          running: false
        });
        vm.saveRowCallback = function(row){
            $mdToast.show(
                $mdToast.simple()
                    .content('Row changed to: '+row)
                    .hideDelay(3000)
            );
        };


        Runner.get($stateParams.id)
            .then(
                function(data)
                {
                    vm.script = data.json;
                  //  vm.script.push(data.json);
                    //console.log(vm.script);

                });
        vm.modes = ['Pig_Latin'];
        vm.themes = ['twilight', 'none'];
        vm.mode = vm.modes[0];
        vm.theme = vm.themes[0];
        vm.args = [];
        Settings.getp('pigArgs')
          .then(
            function(data)
            {
              //$log.info("pig args", data)
              data.json.data.forEach(
                function(element)
                {
                  vm.args.push({arg: element.arg, input: element.default});
                });
              //$log.info('new args', vm.args)
            },
            function(err)
            {
              $log.error(err);
            });
       // vm.args = [{arg: '-t', input: ""}, {arg: '-g', input: ""}, {arg: '-x', input: ""}];
        vm.selectedArgs = [];
        vm.editorModel = '';
        vm.progress = 0;
        vm.log = [];
        //vm.chartLabels = [ 'label 1','label2'];
        //vm.chartSeries = ['series 1','series 2'];
       // vm.chartData = [];
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
            useWrapMode: true,
            showGutter: false,
            theme: vm.theme,
            firstLineNumber: 1,
            onChange: vm.onEditorChange()
        };
        vm.save = function()
        {
            Runner.save(vm.script)
                .then(
                    function(data)
                    {
                        console.log(data);
                        $log.debug('saved: ' + data);
                    },
                    function(err)
                    {
                        $log.error('error: ' +err);
                    });
        }
        vm.canceled = function(id) {
            console.log('changing to list');
            $state.go('home.complex.list');

        }
        vm.run = function()
        {
           // start progress bar
            vm.start = true;
            vm.pigList = [];

            $log.debug('running: ', vm.script.id);
            vm.log = [];
            Runner.run(vm.script.id)
                .then(
                    function(out)
                    {
                       // vm.output = out;
                      vm.running = false;
                    },
                    function(err)
                    {
                        vm.outError = err.json;
                      vm.running = false;
                    },
                    function(update)
                    {
                      vm.running = true;
                        if (update.type == 'progress')
                        {
                            vm.progress = update.data.json;
                                                          //console.log('SCURYVY ' + update.data.json + typeof(update.data.json));
                        }
                        else if (update.type == 'log')
                        {
                            if (update.data.json !== "null")
                            {
                              //var parse = JSON.parse(update.data.json);
                              vm.log.push(update.data.json);

                                //console.log('VM > LOG' + parse);
                            }
                        }
                        else if (update.type == 'output')
                        {
                          if (update.data.json !== "null")
                          {
                              //console.log(update.data.json);
                            //var reg = /(?:(\d+)*)/g
                            //var parse = JSON.parse(update.data.json);
                            //var tem = JSON.parse(update.data.json).split("\n");
                            //console.log('tem ' + tem + ' ' + typeof(tem));
                             // Stop progress bar
                              vm.start = (false);

                              var tmp_output = "(";
                              for (var i = 0; i < Object.keys(update.data.json).length; i++) {
                                  var key = Object.keys(update.data.json)[i];
                                  tmp_output += update.data.json[key];
                                  if (i + 1 < Object.keys(update.data.json).length) {
                                      tmp_output += ", ";
                                  }
                              }
                              tmp_output += ")\n";

                            vm.output.push(tmp_output);
                            vm.pigList.push(update.data.json);

                            //var pi = parse.toString().match(reg);
                            //vm.pigList = tem; //toList(pi);
                            ////vm.output = pigList;
                            //vm.output = parse;
                        //    vm.chartData.push(pi);
                          }
                        }
                    });
        };
        vm.exists = function(item, list)
        {
            if(angular.isDefined(list) && angular.isDefined(item))
            {
                //$log.debug('Item, list', item, list);
                //return list.indexOf(item) > -1;
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
            var indx = _.findIndex(list, 'arg', item)
            //$log.debug('index of ', indx, item);
            return indx;
        }
        
        vm.checkTrue = function(dat)
        {
            // clear var's
                vm.barT = false;
                vm.lineT = false;
                vm.radarT = false;
            console.log('in check true');
            if(dat == 'var')
            {
                vm.barT = true;
                vm.lineT = false;
                vm.radarT = false;
            }
             if(dat == 'line')
            {
                vm.barT = false;
                vm.lineT = true;
                vm.radarT = false;
            }
             if(dat == 'radar')
            {
                vm.barT = false;
                vm.lineT = false;
                vm.radarT = true;
            }
            
        }
       
       // vm.ME = function(){console.log('ME');}
        
        vm.openSettings = function(ev)
        {
            vm.script.graph = 'bar';
            
       $mdDialog.show({
           controller: SettingsController,
      template: '<md-dialog  ng-cloak>'+
  '<form>'+
   ' <md-toolbar>'+
    '  <div class="md-toolbar-tools">'+
     '   <h2>Graph Settings</h2>'+
        '<span flex></span>'+
      '</div>'+
    '</md-toolbar>'+
    '<md-dialog-content>'+
      '<div class="md-dialog-content">'+
           
       ' <legend>How would you like to view your output?</legend>'+
    
    ' <md-checkbox ng-checked="exists(item, selected)" ng-click="toggle(item, selected)">'+
            '  Bar Graph'+
           '<span ng-if="exists(item, selected)"></span>'+
              '</md-checkbox>'+

       
   '   </div>'+
           '<md-button class="md-raised md-primary" ng-click="cancel()">Close</md-button>' +
  '  </md-dialog-content>'+
  '</form>'+
'</md-dialog>',
        clickOutsideToClose: true,
           parent: angular.element(document.body),
      targetEvent: ev,
           locals:{parent:vm},
            
       });
            
      
      
          
   }
    
           // Code for Drop Down Menu
        /*
    var originatorEv;
    vm.notificationsEnabled = true;

    
    vm.openMenu = function($mdOpenMenu, ev) 
    {
        console.log('in list button');
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    
    vm.toggleNotifications = function() 
    {
        vm.notificationsEnabled = !vm.notificationsEnabled;
    };

    vm.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
            .targetEvent(originatorEv)
            .clickOutsideToClose(true)
            .parent('body')
            .title('Script Name')
          //.textContent('You just called a friend;')
            .ok('That was easy')
      );
      originatorEv = null;
    };
    
    vm.checkVoicemail = function()
    {
        console.log('make me do something');
    };
    */

    });


function SettingsController( $mdDialog, $scope) {
    console.log('in settings controller');
    
    $scope.items = [1,2,3,4,5];
      $scope.selected = [];
      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };
      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };
        
     //$scope.items = [1,2,3];
    //$scope.labels= ["193.0.9.1", "65.22.8.1", "130.57.2.4","129.79.1.8","128.59.1.1"];
    //$scope.series = ['Series A'];
   // $scope.data = data;
    //$scope.data = [[[0.647934],[0.074285716],[0.0670727],[0.059859693],[0.05745536]]];
$scope.cancel = function() {
    $mdDialog.cancel();
  };

 
}

/*'<input type="checkbox" ng-click="vm.checkTrue(line)" ng-checked="vm.lineT" >Line Graph<br> '+
'<input type="checkbox"  ng-click="vm.checkTrue(radar)" ng-checked="vm.radar">Radar Graph<br> '+

 ' <md-checkbox  ng-click="vm.checkTrue(\'line\')"><span>Bar Graph</span>'+*/