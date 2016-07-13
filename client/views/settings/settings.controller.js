/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .controller('SettingsCtrl', function ($mdToast, $log, Settings, lodash, Runner, $q) {

    var vm = this;
    Runner.list()
      .then(
        function(data)
        {
          vm.script= data.json;
        });
      var priv = {
        removedArgs: [],
        /**
         * Description
         * @method getToastPosition
         */
        getToastPosition: function()
        {
          return {
            bottom: false,
            top: true,
            left: false,
            right: true
          };
        }
      }


      angular.extend(vm, {
        name: 'SettingsCtrl',
        ins: Settings.list(),
        /**
         * Description
         * @method save
         * @param {} data
         * @param {} script
         */
        save: function(data, script)
        {
          for(var i = 0; i < vm.script.length; i++)
          {
            if(script.name == vm.script[i].name)
            {
              vm.script[i].name = script.name;
            }
          }

          Runner.save(script)
            .then(
              function(data)
              {

                $log.debug('saved: ' + JSON.stringify(data));
              },
              function(err)
              {
                $log.error('error: ' +err);
              })


            //TODO:save the settings to the server
            $log.debug(data);
            var goodCount = 0;
            var badCount = [];
            data.forEach(
              function(e)
              {
                $log.debug(e);
                Settings.update(e)
                  .then(
                    function(datas)
                    {
                      $log.debug('data');
                      goodCount++;
                      if(goodCount == data.length)
                      {
                        vm.showSavedToast();
                      }
                    },
                    function(err)
                    {
                      $log.error('err');
                      badCount.push(err);
                      if (badCount.length > 0)
                      {
                        vm.showErrorToast(badCount);
                      }
                    });
              });
            $log.debug(goodCount);
        },
        /**
         * Description
         * @method showSavedToast
         */
        showSavedToast: function() {
          $mdToast.showSimple('Settings Saved!');
        },
        /**
         * Description
         * @method showErrorToast
         * @param {} err
         */
        showErrorToast: function(err) {
          $mdToast.show(
            $mdToast.simple()
            .textContent('Error: ' + err +'!')
            .position("top right")
            .hideDelay(3000)
          )
        },
        /**
         * Description
         * @method showRemovedArgToast
         * @param {} opt
         */
        showRemovedArgToast: function(opt)
        {
          var pinTo = priv.getToastPosition();
          var toast = $mdToast.simple()
            .textContent('Removed as Pig Argument default')
            .action('UNDO')
            .highlightAction(true)
            .position("top right");
          $mdToast.show(toast)
            .then(
              function(response)
              {
                if ( response == 'ok' )
                {
                  vm.ins[opt].data.push(priv.removedArgs.pop());
                  alert('You clicked the \'UNDO\' action.');
                }
              });
        },
        udfs: {displayName: 'User Defined Functions (UDF):', data: []},
        /**
         * Description
         * @method removeArg
         * @param {} opt
         * @param {} index
         */
        removeArg: function(opt, index)
        {
          if(!lodash.isUndefined(vm.ins[opt].data[index]))
          {

            if(index == vm.ins[opt].data.length-1)
            {
              priv.removedArgs.push(vm.ins[opt].data.pop());
            }
            else if(index == 0)
            {
              priv.removedArgs.push(vm.ins[opt].data.unshift());
            }
            else
            {
              priv.removedArgs.push(lodash.slice(vm.ins[opt].data,index));
            }
            vm.showRemovedArgToast(opt);
            $log.info("type of: ", Array.isArray(vm.ins[opt].data), "removed index: ", index, 'from: ', vm.ins[opt].data, priv.removedArgs);
          }

          $log.info('remove clicked');
        },
        /**
         * Description
         * @method addArg
         * @param {} opt
         * @param {} temp
         */
        addArg: function(opt, temp)
        {
          vm.ins[opt].data.push({description: "", arg: temp, default: "" });
          $log.info('add clicked');
        }
      });

      Settings.list()
        .then(
          function(data)
          {
            vm.ins = data;
          });
        Settings.getp('udfs')
          .then(
            function(data)
            {
              vm.udfs = data.json;
            });
          /**
           * Description
           * @method scriptSelect
           * @param {} script
           */
          vm.scriptSelect = function(script)
          {
            vm.script.line = script.line;
            vm.script.bar = script.bar;
            vm.script.radar = script.radar;
            vm.script.numOutput = script.numOutput;
          }


  });
