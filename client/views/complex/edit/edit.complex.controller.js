'use strict';

angular.module('hog')

.controller('EditComplexCtrl',
  function ($scope, $window, $timeout, $log, $state, $stateParams, HogTemplates, Runner, lodash, Settings, $mdToast,  NgTableParams, $interval, Pig, $mdDialog, PigCompleter, FileSaver, Blob)
    {
      var vm = this;
      //vm.script =  Runner.getData();

      var ctx;
      var myNewChart;

      // Graphs are not displayed initially
      vm.outputs = [];
      vm.graph_data = false;

      vm.edited = false;
      vm.name_edited = false;
      vm.args_edited = false;
      vm.script_edited = false;

      vm.taskList = [];
      vm.running = false;

      Pig.on('tracker:update', function (data)
          {
            vm.taskList = data;
          });

      Pig.on('run:finished', function ()
          {
            vm.running = false;
          });

      vm.ots = function (o)
      {
        return JSON.stringify(o);
      }

      // Initialize chart values
      vm.labels = [];
      vm.series = ['Series A'];
      vm.data = [];


      // Inject data from PIG script output to chart
      vm.getData = function(newData)
      {
        var t = JSON.parse(newData);
        vm.data[0] = t;
      };

      var _ = lodash;
      angular.extend(this, {
        name: 'EditComplexCtrl',
        running: false
      });

      Runner.get($stateParams.id)
        .then(
            function(data)
            {
              vm.script = data.json;
              vm.latestVersion = vm.currentVersion = vm.version = vm.script.version;
              vm.versions = vm.script.history;
              vm.version = vm.currentVersion = vm.versions[vm.versions.length-1];
              if(typeof vm.script.args[0] != 'string')
              {
                var strfy = _.flatMap(vm.script.args,
                  function(n)
                  {
                    return [n.arg, n.input];
                  });

                vm.args = strfy.join(" ").trim();
              }
              else
              {
                vm.args = vm.script.args.join(" ");
              }
              vm.script_data = vm.script.data;
              $scope.script_data = vm.script_data;
              $scope.script_name = vm.script.name;
              $scope.script_args = vm.args;
            });
      vm.getVersion = function(idx)
      {
        vm.leftIdx = vm.versions.length-1;
        vm.rightIdx = lodash.findIndex(vm.versions, ['version', vm.version.version]);
      }
      vm.bumpVersion = function()
      {
        Runner.bumpVersion(vm.script._id)
          .then(
            function(data)
            {
              vm.script.version = vm.latestVersion = vm.currentVersion = vm.version = data.json;
            },
            function(err)
            {
              console.log(err);
            });
      }
      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.selectedArgs = [];
      vm.editorModel = '';
      vm.progress = 0;

      vm.info_outputs = [];
      vm.logs = [];
      vm.warnings = [];
      vm.errors = [];

      vm.onEditorLoad = function(_ace)
      {
        //_ace.setKeyboardHandler("ace/keyboard/vim");
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        };
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
        useWrapMode: false,
        showGutter: true,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange()
      };



      vm.downloadScript = function()
      {
        var data = new Blob([vm.script.data], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(data, vm.script.name + ".pig");
      };




      vm.deleteScript = function()
      {
        Runner.destroy(vm.script._id)
          .then(
              function(data)
              {
                $state.go('^.list');
              });
      };




      vm.save = function(graph, numOutput, cb)
      {

        vm.script.data = $scope.script_data;
        vm.script.name = $scope.script_name.replace(/[\s,\.]/g, "_");
        vm.script.args = $scope.script_args.split(" ");
        vm.script.type = 'complex';
        vm.script.graph_count = numOutput;
        vm.script.graph_type = graph;

        Runner.update(vm.script)
          .then(
              function(data)
              {
                $log.debug('saved: ' + data);

                vm.script = data.json;
                vm.args = vm.script.args.join(" ");

                $scope.script_data = vm.script.data;
                $scope.script_name = vm.script.name;
                $scope.script_args = vm.args;

                vm.latestVersion = vm.currentVersion = vm.version = vm.script.version;
                vm.versions = vm.script.history;
                vm.version = vm.currentVersion = vm.versions[vm.versions.length-1];

                vm.edited = false;

                vm.name_edited = false;
                vm.args_edited = false;
                vm.script_edited = false;


                $mdToast.show(
                  $mdToast.simple()
                  .content('Script Saved!')
                  .hideDelay(3000)
                );
                if (cb)
                {
                  cb();
                }
              },
              function(err)
              {
                $log.error('error: ' +err);
              });
      };



      vm.saveAndRun = function()
      {
        vm.save(null, null, vm.run);
      };



      vm.saveAndRunAndTrack = function()
      {
        vm.save(null, null, vm.runAndTrack);
      };


      vm.kill = function()
      {
        Runner.kill(vm.script._id)
          .then(
              function(data)
              {
                console.log("Killed: " + JSON.stringify(data, null, 2));
              });
      };

      vm.run = function()
      {
        vm.taskList = [];
        // start progress bar
        vm.pigList = [];
        vm.running = true;
        vm.graph_data = false;

        $log.debug('running: ', vm.script._id);

        vm.info_outputs = [];
        vm.outputs = [];
        vm.logs = [];
        vm.warnings = [];
        vm.errors = [];

        Runner.run(vm.script._id)
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
                  vm.progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.logs.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.warnings.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.outputs.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});

                    vm.parseOutput(update.data.json);
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };



      vm.runAndTrack = function()
      {
        vm.taskList = [];
        vm.outputs = [];
        // start progress bar
        vm.pigList = [];
        vm.running = true;
        vm.graph_data = false;
        vm.errors = [];

        $log.debug('running: ', vm.script._id);
        vm.info_outputs = [];
        vm.logs = [];
        vm.warnings = [];
        Runner.runAndTrack(vm.script._id)
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
                  vm.progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.logs.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.warnings.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    var tmp_output = "(";
                    for (var i = 0; i < Object.keys(update.data.json).length; i++) {
                      var key = Object.keys(update.data.json)[i];
                      tmp_output += update.data.json[key];
                      if (i + 1 < Object.keys(update.data.json).length) {
                        tmp_output += ", ";
                      }
                    }
                    tmp_output += ")\n";

                    vm.outputs.push(tmp_output);
                    vm.info_outputs.push({data: tmp_output, type: "output", color: {'color': 'green.400'}});
                    vm.parseOutput(tmp_output);
                    vm.graph_data = true;
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };




      vm.exists = function(item, list)
      {
        if(angular.isDefined(list) && angular.isDefined(item))
        {
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
        var indx = _.findIndex(list, 'arg', item);
        return indx;
      };



      vm.parseOutput = function (data)
      {
        var failed = false;
        try
        {
          var tmp_data = data
            .replace(/\(/g, "[")
            .replace(/\)/g, "]")
            .replace(/(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(\w+\.*\w*))/g, '"$1$2"');

          var output_data = JSON.parse(tmp_data);
        }
        catch (err)
        {
          failed = true;
        }
        finally
        {
          if (!failed)
          {
            vm.pigList.push(output_data);
          }
        }

      };


      $scope.$watch("script_name", function(newValue, oldValue)
      {
        if (vm.script)
        {
          if (vm.script.name !== "undefined")
          {
            if (newValue !== vm.script.name)
            {
              vm.name_edited = true;
            }
            else
            {
              vm.name_edited = false;
            }
            updateEdit();
          }
        }
      });




      $scope.$watch("script_args", function(newValue, oldValue)
      {
        if (vm.args !== "undefined")
        {
          if (newValue !== vm.args)
          {
            vm.args_edited = true;
          }
          else
          {
            vm.args_edited = false;
          }
          updateEdit();
        }
      });




      $scope.$watch("script_data", function(newValue, oldValue)
      {
        if (vm.script)
        {
          if (vm.script.data !== "undefined")
          {
            if (newValue !== vm.script.data)
            {
              vm.script_edited = true;
            }
            else
            {
              vm.script_edited = false;
            }
            updateEdit();
          }
        }
      });



      function updateEdit ()
      {
        vm.edited = vm.name_edited || vm.args_edited || vm.script_edited;
      };
      vm.openVersionDifferenceInfo = function(ev)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.versionDiffTemplate,
          controller: HogTemplates.VersionDiffController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            vm: {
              versions: vm.versions,
              leftIdx: vm.leftIdx,
              rightIdx: vm.rightIdx,
              latest: vm.latestVersion
            }
          },
        })
        .then(
          function(data)
          {
            if(data.revertIdx >= 0 && data.revertIdx < vm.versions.length)
            {
              $timeout(
                function()
                {
                  $scope.script_data = data.source;
                 vm.version = vm.currentVersion = vm.versions[data.revertIdx];
                });
            }
          });
      };

      vm.openGraphInfo = function(ev, graph_data, script)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.graphInfoTemplate,
          controller: HogTemplates.GraphInfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            graph_data: graph_data || vm.pigList,
            script: script || vm.script
          },
        });
      };



      vm.openInfo = function(ev, filter_type)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.outputInfoTemplate,
          controller: HogTemplates.InfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_name: vm.script.name,
            info_outputs: vm.info_outputs,
            outputs: vm.outputs,
            logs: vm.logs,
            warnings: vm.warnings,
            errors: vm.errors,
            filter_type: filter_type,
            graph_data: vm.pigList,
            openGraphInfo: vm.openGraphInfo,
            script_index: null
          },
        });
      };



      vm.openSettings = function(ev)
      {

        $mdDialog.show({
          controller: SettingsController,
          templateUrl: HogTemplates.complexEditSettingsTemplate,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals:{vm:vm},

        });

      };

    });


// Controller for Settings Modal
function SettingsController( $mdDialog, $scope, vm)
{
  $scope.vm = vm;
  $scope.cancel = function()
  {
    $mdDialog.cancel();
  };


  $scope.graph = {
    Bar: false,
    Line: false,
    Radar: false
  };

  $scope.graph_type = $scope.vm.script.graph_type || "Bar";
  $scope.graph[$scope.graph_type] = true;

  $scope.graph_output_count = $scope.vm.script.graph_count;

  $scope.deleteScript = function()
  {
    $scope.vm.deleteScript();
    $scope.cancel();
  };

  $scope.save = function()
  {
    if ($scope.graph.Bar)
    {
      $scope.graph_type = "Bar";
    }
    else if ($scope.graph.Line)
    {
      $scope.graph_type = "Line";
    }
    else if ($scope.graph.Radar)
    {
      $scope.graph_type = "Radar";
    }
    else
    {
      $scope.graph_type = "Bar";
    }

    $scope.vm.save($scope.graph_type, $scope.graph_output_count);
    $scope.cancel();
  }
};
