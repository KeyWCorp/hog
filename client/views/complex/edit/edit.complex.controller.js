'use strict';

angular.module('hog')
    .controller('EditComplexCtrl', function ($log, $state,$stateParams, Runner, lodash, Settings, $mdToast)
    {
        var vm = this;
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
        vm.nutritionList = [
            {
                id: 601,
                name: 'Frozen joghurt',
                calories: 159,
                fat: 6.0,
                carbs: 24,
                protein: 4.0,
                sodium: 87,
                calcium: '14%',
                iron: '1%'
            },
            {
                id: 602,
                name: 'Ice cream sandwitch',
                calories: 237,
                fat: 9.0,
                carbs: 37,
                protein: 4.3,
                sodium: 129,
                calcium: '84%',
                iron: '1%'
            },
            {
                id: 603,
                name: 'Eclair',
                calories: 262,
                fat: 16.0,
                carbs: 24,
                protein: 6.0,
                sodium: 337,
                calcium: '6%',
                iron: '7%'
            },
            {
                id: 604,
                name: 'Cupkake',
                calories: 305,
                fat: 3.7,
                carbs: 67,
                protein: 4.3,
                sodium: 413,
                calcium: '3%',
                iron: '8%'
            },
            {
                id: 605,
                name: 'Gingerbread',
                calories: 356,
                fat: 16.0,
                carbs: 49,
                protein: 2.9,
                sodium: 327,
                calcium: '7%',
                iron: '16%'
            },
            {
                id: 606,
                name: 'Jelly bean',
                calories: 375,
                fat: 0.0,
                carbs: 94,
                protein: 0.0,
                sodium: 50,
                calcium: '0%',
                iron: '0%'
            },
            {
                id: 607,
                name: 'Lollipop',
                calories: 392,
                fat: 0.2,
                carbs: 98,
                protein: 0,
                sodium: 38,
                calcium: '0%',
                iron: '2%'
            },
            {
                id: 608,
                name: 'Honeycomb',
                calories: 408,
                fat: 3.2,
                carbs: 87,
                protein: 6.5,
                sodium: 562,
                calcium: '0%',
                iron: '45%'
            },
            {
                id: 609,
                name: 'Donut',
                calories: 452,
                fat: 25.0,
                carbs: 51,
                protein: 4.9,
                sodium: 326,
                calcium: '2%',
                iron: '22%'
            },
            {
                id: 610,
                name: 'KitKat',
                calories: 518,
                fat: 26.0,
                carbs: 65,
                protein: 7,
                sodium: 54,
                calcium: '12%',
                iron: '6%'
            }
        ];
  
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
                              vm.log.push(parse[0]);
                            }
                        }
                        else if (update.type == 'output')
                        {
                          if (update.data.json !== "null")
                          {
                            var reg = /(?:(\d+)*)/g
                            var parse = JSON.parse(update.data.json);
                            var pi = parse.toString().match(reg);
                            console.log(parse, pi);
                            
                            vm.output = parse;
                            console.log(typeof parse);
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
    });

