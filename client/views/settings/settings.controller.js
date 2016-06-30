/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .controller('SettingsCtrl', function ($mdToast, $log, Settings, lodash, Runner, $q) {

    var vm = this;
    //vm.script =  Runner.getData();
   
    // This may not be needed
    Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              vm.script= data.json;
              //  console.log(vm.script[2].name);
               // console.log(JSON.stringify(vm.script));
            });
    
    
   // var empty = {};
    //e/mpty = Runner.update(vm.script);
 
   // vm.items = ['harry', 'dic', 'coxe' ];
   // console.log('Emptuy ' + JSON.stringify(empty));
       // console.log('STSTT ' + JSON.stringify(vm.script.name));

//    vm.script = {};
    var priv = {
      removedArgs: [],
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
      save: function(data, script)
      {
         
        //  console.log(script.name); 
          //console.log(vm.script[2].name);
        
          for(var i = 0; i < vm.script.length; i++)
          {
                

              if(script.name == vm.script[i].name)
              {
                  vm.script[i].name = script.name;
               //   console.log(vm.script[i].name);

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
      showSavedToast: function() {
        /*$mdToast.show(
          $mdToast.simple()
            .textContent('Settings Saved!')
            .position({
              bottom: false,
              top: true,
              left: false,
              right: true
            })
            .hideDelay(3000)
        )*/
        $mdToast.showSimple('Settings Saved!');
      },
      showErrorToast: function(err) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Error: ' + err +'!')
            .position("top right")
            .hideDelay(3000)
        )
      },
      showRemovedArgToast: function(opt)
      {
        var pinTo = priv.getToastPosition();
        var toast = $mdToast.simple()
          .textContent('Removed as Pig Argument default')
          .action('UNDO')
          .highlightAction(true)
          //.highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
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
         // delete vm.ins[opt].data[index];
          $log.info("type of: ", Array.isArray(vm.ins[opt].data), "removed index: ", index, 'from: ', vm.ins[opt].data, priv.removedArgs);
        }
        
        $log.info('remove clicked');
      },
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
        //vm.udfs = data[1];
      });
  Settings.getp('udfs')
    .then(
      function(data)
      {
        vm.udfs = data.json;
      });
    
  /* vm.clearValue = function() {
   vm.myModel = undefined;
  };*/
    vm.scriptSelect = function(script)
    {
//console.log('asdfasd' + JSON.stringify(script));
        vm.script.line = script.line;
        vm.script.bar = script.bar;
        vm.script.radar = script.radar;
        vm.script.numOutput = script.numOutput;
    }
    
 
});