'use strict';

angular.module('hog')
  .controller('ComplexCtrl', function ($log, Runner) {

    var vm = this;
    angular.extend(vm, {
        name: 'ComplexCtrl',
    });
   /* vm.modes = ['Pig_Latin', 'markdown', 'Scheme', 'XML', 'Javascript'];
    vm.themes = ['twilight', 'none'];
    vm.mode = vm.modes[0];
    vm.theme = vm.themes[0];
    vm.args = [{arg: '-t', input: ""}, {arg: '-g', input: ""}, {arg: '-x', input: ""}];
    vm.selectedArgs = [];
    vm.editorModel = '';
    Runner.list()
        .then(
            function(data)
            {
                vm.programs = data.json;
                vm.editorModel = vm.programs[0].data;
                vm.selectedArgs = vm.programs[0].args;
                vm.name = vm.programs[0].name;
            });
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
        var program = {
            name: vm.name,
            data: vm.editorModel,
        };
        Runner.save(program);
    }
    vm.run = function()
    {
        // Temp check
        if(vm.programs[0].id == 0)
        {
            $log.debug('running: ', vm.programs[0].id);
             Runner.run(vm.programs[0].id)
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
                                if (update.type == 'progress')
                                {
                                    vm.progress = update.data;
                                }
                                else if (update.type == 'log')
                                {
                                    vm.log = update.data;
                                }
                            });
        }
        else
        {
        Runner.create({name: vm.name, data: vm.editorModel, args: vm.selectedArgs})
            .then(
                function(data)
                {
                    Runner.run(data.id)
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
                                if (update.type == 'progress')
                                {
                                    vm.progress = update.data;
                                }
                                else if (update.type == 'log')
                                {
                                    vm.log = update.data;
                                }
                            });
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
    };*/
    

  });
