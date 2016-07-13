/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.controller('ListSimpleCtrl', function ($log, $scope, $state, HogTemplates, Runner, Pig, $mdDialog, lodash)
    {
      var vm = this;

      vm.output_data = {};
      vm.running = false;
      vm.current_running_id = "";
      vm.isRunning = {};
      vm.output = {};
      vm.scripts = {};

      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.selectedArgs = [];
      vm.editorModel = '';
      vm.progress = 0;
      vm.filter_disabled = false;
      vm.filter_noCache = false;
      vm.searchText = "";
      vm.selectedItem = null;



      /**
       * Description
       * @method onEditorLoad
       * @param {} _ace
       */
      vm.onEditorLoad = function(_ace)
      {
        /**
         * Description
         * @method modeChanged
         */
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        }
        _ace.$blockScrolling = Infinity;
      };



      /**
       * Description
       * @method onEditorChange
       * @param {} _ace
       */
      vm.onEditorChange = function(_ace)
      {

      };



      vm.editorOptions = {
        mode: vm.mode.toLowerCase(),
        /**
         * Description
         * @method onLoad
         * @param {} _ace
         */
        onLoad: function(_ace) {vm.onEditorLoad(_ace);},
        useWrapMode: false,
        showGutter: false,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange(),
        readOnly: true
      };



      /**
       * Description
       * @method getScripts
       */
      vm.getScripts = function ()
      {
        Runner.simpleList()
          .then(
              function (data)
              {
                vm.scripts = {};
                vm.scripts = data.json;
              });
      };



      vm.getScripts();



      Pig.on('run:finished', function ()
          {
            vm.running = false;
            vm.current_running_id = "";
            Object.keys(vm.isRunning).map(function (key)
                {
                  if (vm.isRunning[key] === true)
                  {
                    vm.isRunning[key] = false;
                  }
                });
          });



      /**
       * Description
       * @method deleteScript
       * @param {} ev
       * @param {} id
       */
      vm.deleteScript = function(ev, id)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.deleteDialogTemplate,
          controller: HogTemplates.DeleteDialogController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_id: id,
            /**
             * Description
             * @method cb
             * @param {} data
             */
            cb: function (data)
            {
              Runner.simpleList()
                .then(
                    function(data)
                    {
                      vm.scripts = {};
                      vm.scripts = data.json;
                    });
            }
          },
        });
      };



      /**
       * Description
       * @method kill
       * @param {} id
       */
      vm.kill = function(id)
      {
        Runner.kill(id)
          .then(
              function(data)
              {
                console.log("Killed: " + JSON.stringify(data, null, 2));
              });
      };



      /**
       * Description
       * @method run
       * @param {} id
       */
      vm.run = function(id)
      {
        vm.output[id] = [];
        vm.running = true;
        vm.isRunning[id] = true;
        vm.current_running_id = id;

        vm.scripts[id].info_outputs = [];
        vm.scripts[id].outputs = [];
        vm.scripts[id].pigList = [];
        vm.scripts[id].logs = [];
        vm.scripts[id].warnings = [];
        vm.scripts[id].errors = [];

        $log.debug('running: ', id);
        Runner.run(id)
          .then(
              function(end)
              {
                console.log("END");
              },
              function(error)
              {
                console.log("ERROR: " + JSON.stringify(error));
              },
              function(update)
              {
                if (update.type == 'progress')
                {
                  vm.scripts[id].progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].logs.push(update.data.json);
                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].warnings.push(update.data.json);
                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.scripts[id].outputs.push(update.data.json);
                    HogTemplates.parseOutput(update.data.json, vm.scripts[id].pigList);


                    vm.scripts[id].info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.scripts[id].errors.push(update.data.json);
                  vm.scripts[id].info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };



      /**
       * Description
       * @method edit
       * @param {} id
       */
      vm.edit = function(id)
      {
        $state.go('^.edit', {id: id});
      };



      /**
       * Description
       * @method ots
       * @param {} d
       */
      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };



      /**
       * Description
       * @method openGraphInfo
       * @param {} ev
       * @param {} id
       */
      vm.openGraphInfo = function(ev, id)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.graphInfoTemplate,
          controller: HogTemplates.GraphInfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            graph_data: vm.scripts[id].pigList,
            script: vm.scripts[id]
          },
        });
      };



      /**
       * Description
       * @method openInfo
       * @param {} ev
       * @param {} id
       * @param {} filter_type
       */
      vm.openInfo = function(ev, id, filter_type)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.outputInfoTemplate,
          controller: HogTemplates.InfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_name: vm.scripts[id].name,
            info_outputs: vm.scripts[id].info_outputs,
            outputs: vm.scripts[id].outputs,
            logs: vm.scripts[id].logs,
            warnings: vm.scripts[id].warnings,
            errors: vm.scripts[id].errors,
            filter_type: filter_type,
            graph_data: vm.scripts[id].pigList,
            openGraphInfo: vm.openGraphInfo,
            script_id: id
          },
        });
      };



      angular.extend(vm, {
        name: 'ListSimpleCtrl',
      });



      /**
       * Description
       * @method createFilterFor
       * @param {} query
       */
      vm.createFilterFor = function(query)
      {
        var lowercaseQuery = lodash.toLower(query);
        return function filterFn(script)
        {
          return (lodash.toLower(script.name).indexOf(lowercaseQuery) !== -1);
        };
      }



      /**
       * Description
       * @method querySearch
       * @param {} query
       */
      vm.querySearch = function(query)
      {
        var results = query ? lodash.filter( vm.scripts, vm.createFilterFor(query) ) : vm.scripts;
        return results;
      }
    });
