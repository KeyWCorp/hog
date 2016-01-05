'use strict';

angular.module('hog')
    .controller('EditComplexCtrl', function ($log, $stateParams, Runner, lodash)
    {
        var vm = this;
        var _ = lodash;
        angular.extend(this, {
          name: 'EditComplexCtrl'
        });
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
        vm.args = [{arg: '-t', input: ""}, {arg: '-g', input: ""}, {arg: '-x', input: ""}];
        vm.selectedArgs = [];
        vm.editorModel = '';
        vm.progress = 0;
        vm.log = [];
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
        vm.run = function()
        {
            $log.debug('running: ', vm.script.id);
            vm.log = [];
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
                            vm.log.push(update.data.json);
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
                var idx = list.indexOf(item);
                if (idx > -1) list.splice(idx, 1);
                else list.push(item);
            }
        };
        vm.index = function(list, item)
        {
            var indx = _.findIndex(list, 'arg', item)
            $log.debug('index of ', indx, item);
            return indx;
        }
    });