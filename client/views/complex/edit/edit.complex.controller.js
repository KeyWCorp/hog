'use strict';

angular.module('hog')
    .controller('EditComplexCtrl', function ($log, $state,$stateParams, Runner, lodash, Settings, $mdToast,  NgTableParams)
    {

   
    var vm = this;
 
    // Graphs are not displayed initially
    vm.showLine = false;
    vm.bar = false;
    vm.radar = false;
    vm.pie = false;

    // Initialize chart values
    vm.labels = ["Value1", "Value2", "Value3"];
    vm.series = ['Series A'];
    vm.data = [];
    
    // Inject data from PIG script output to chart
    vm.getData = function(newData)
        {
            console.log(JSON.parse(newData));
            var t = JSON.parse(newData);
            console.log(t);
            vm.data[0] = t;
        };
    
    // Display the Bar Graph
    vm.showBarGraph = function()
        {
            vm.bar = true;
            vm.pie = false;
            vm.showLine = false;
            vm.radar = false;
        };

    // Display the Radar Chart
    vm.showRadarChart = function()
        {
            vm.bar = false;
            vm.pie = false;
            vm.showLine = false;
            vm.radar = true;
        };

    // Display the Line Graph
    vm.showLineGraph = function()
        {
            vm.showLine = true;
            vm.pie = false;
            vm.bar = false;
            vm.radar = false;
        };
      // Display the Pie Graph
    vm.showLPieChart = function()
        {
            vm.pie = true;
            vm.showLine = false;
            vm.bar = false;
            vm.radar = false;
        vm.pidata = [1,2,3];
        };
    
    // User selects values from table, 
    // set vm.data equal to the changes
    vm.onChange = function()
        {
            vm.data = []; 
            for(var i = 0; i < vm.testData.length; i++)
                {
                    var hold = JSON.stringify(vm.testData[i]).replace("(","[").replace(")","]").replace(/"/g, "");
                    vm.data.push(JSON.parse(hold));
                }
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
                });
        vm.modes = ['Pig_Latin'];
        vm.themes = ['twilight', 'none'];
        vm.mode = vm.modes[0];
        vm.theme = vm.themes[0];
        vm.args = [];
        Settings.get('args').forEach(
          function(element)
          {
            vm.args.push({arg: element, input: ""});
          })
       // vm.args = [{arg: '-t', input: ""}, {arg: '-g', input: ""}, {arg: '-x', input: ""}];
        vm.selectedArgs = [];
        vm.editorModel = '';
        vm.progress = 0;
        vm.log = [];
        vm.chartLabels = [ 'label 1','label2'];
        vm.chartSeries = ['series 1','series 2'];
        vm.chartData = [];
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
                        }
                        else if (update.type == 'log')
                        {
                            if (update.data.json !== "null")
                            {
                              var parse = JSON.parse(update.data.json);
                             // vm.log.push(parse[0]);
                               // console.log('VM > LOG' + parse);
                            }
                        }
                        else if (update.type == 'output')
                        {
                          if (update.data.json !== "null")
                          {
                            var reg = /(?:(\d+)*)/g
                            var parse = JSON.parse(update.data.json);
                            var tem = JSON.parse(update.data.json).split("\n");
                            console.log('tem ' + tem + ' ' + typeof(tem));
                            var pi = parse.toString().match(reg);
                            vm.pigList = tem; //toList(pi);
                            //vm.output = pigList;
                            vm.output = parse;
                            vm.chartData.push(pi);
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
        
    function toList (_input) 
    {
        var output = [];
        var tmp_list = [];
        var count = 0;
            for (var i = 0; i < _input.length; i++) 
            {
                var item = _input[i];
                if (item) 
                {
                    tmp_list.push(item);
                    count++;
                    if (count > 0 && count % 3 == 0)
                    {
                        output.push(tmp_list);
                        tmp_list = [];
                    }
                }
            }
        return output;
    }
        
    });

