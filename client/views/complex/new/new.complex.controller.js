'use strict';

angular.module('hog')
    .controller('NewComplexCtrl', function ($log, Runner)
    {
        var vm = this;
        angular.extend(vm, {
            name: 'NewComplexCtrl'
        });
        vm.modes = ['Pig_Latin'];
        vm.themes = ['twilight', 'none'];
        vm.mode = vm.modes[0];
        vm.theme = vm.themes[0];
        vm.args = [{arg: '-t', input: ""}, {arg: '-g', input: ""}, {arg: '-x', input: ""}];
        //vm.selectedArgs = [];
        //vm.editorModel = '';
        vm.firstTime = true;
        vm.script = {
            name: '',
            data: '',
            args: []
        };
        
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
            if (vm.firstTime)
            {
                vm.firstTime = false;
                Runner.create(vm.script)
                    .then(
                        function(data)
                        {
                            // Place pop up for saved
                        });
            }
            else
            {
                Runner.save(vm.script)
                    .then(
                        function(data)
                        {
                            // Place save popup
                        });
            }
        }
        
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
        vm.run = function()
        {
            console.log('vm.script.id ' + vm.script.id );
            if (angular.isDefined(vm.script.id))
            {
                
                $log.debug('running: ', vm.script.id);
                Runner.run(vm.script.id)
                    .then(
                        function(out)
                        {
                            vm.output = out.json;
                        },
                        function(err)
                        {
                            vm.outError = err.json;
                        },
                        function(update)
                        {
                            if (update.type == 'progress')
                            {
                                vm.progress = update.data.json;
                            }
                            else if (update.type == 'log')
                            {
                                vm.log = update.data.json;
                            }
                        });
            }
            else
            {
                Runner.create(vm.script)
                    .then(
                        function(data)
                        {
                            $log.debug('data' + data.json);
                            vm.script = data.json;
                            $log.debug('script', vm.script);
                        });
            }
        };
        vm.exists = function(item, list)
        {
            //$log.debug('Item, list', item, list);
            return list.indexOf(item) > -1;
        };
        vm.toggle = function(item, list)
        {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };
    });