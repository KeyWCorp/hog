/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.controller('NewComplexCtrl', function ($log, Runner, $mdToast, $state, PigCompleter)
    {

      var vm = this;
      angular.extend(vm, {
        name: 'NewComplexCtrl'
      });
      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.args = "";
      vm.firstTime = true;
      vm.script = {
        name: '',
        data: '',
        args: [],
        version: '',
        type: 'complex'
      };

      vm.onEditorLoad = function(_ace)
      {
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        }
        _ace.$blockScrolling = Infinity;
        var langTools = ace.require("ace/ext/language_tools");
        langTools.addCompleter(PigCompleter);
      };



      vm.onEditorChange = function(_ace)
      {

      };




      vm.editorOptions = {
        advanced: {
          enableSnippets: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true
        },
        mode: vm.mode.toLowerCase(),
        onLoad: function(_ace) {vm.onEditorLoad(_ace);},
        useWrapMode: true,
        showGutter: false,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange()
      };


      vm.upload = function()
      {
        document.getElementById('fileInput').click();
      };

      vm.uploadScript = function($fileContent)
      {
        vm.script.data = $fileContent;
      };



      vm.save = function()
      {
        vm.script.args = vm.args.split(" ");
        vm.script.name = vm.script.name.replace(/[\s,\.]/g, "_");
        Runner.create(vm.script)
          .then(
              function(data)
              {
                vm.script = data.json;
                $mdToast.show(
                    $mdToast.simple()
                    .content('Script Saved!')
                    .hideDelay(3000)
                    );
                $state.go('^.edit', {id: vm.script._id});
              });
      }



      vm.run = function()
      {
        if (angular.isDefined(vm.script._id))
        {

          $log.debug('running: ', vm.script._id);
          Runner.run(vm.script._id)
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
        return list.indexOf(item) > -1;
      };



      vm.toggle = function(item, list)
      {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
      };
    });
