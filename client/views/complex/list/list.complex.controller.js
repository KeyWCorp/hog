'use strict';

angular.module('hog')
    .controller('ListComplexCtrl', function ($log, $state, Runner)
    {
        var vm = this;
        angular.extend(vm, {
            name: 'ListComplexCtrl',
            scripts: [],
            edit: function(id)
            {
              $state.go('^.edit', {id: id});
            },
            run: function(id, idx)
            {
              var processPercent = 0;
              Runner.run(id)
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
                    if (angular.isUndefined(vm.scripts[idx]))
                    {
                      console.log(vm.scripts);
                      console.error('Id ',idx,' not found');
                      return;
                    }
                    console.log(update.type);

                    if (update.type == 'end')
                    {
                      vm.scripts[idx].progress = 100;
                    }
                    else if (update.type == 'progress')
                    {
                      //process status
                      processPercent = percent_data(processPercent);

                      //vm.scripts[idx].progress = update.data;
                      vm.scripts[idx].progress = processPercent;
                    }
                    else if (update.type == 'log')
                    {
                      processPercent = percent_data(processPercent);
                      vm.scripts[idx].progress = processPercent;
                      console.log('Json: ', update.data.json == null ? "null" : "not null");
                      console.log(typeof update.data.json);
                      if (update.data.json !== "null")
                      {
                        var parse = JSON.parse(update.data.json);
                        vm.scripts[idx].logs.push(parse[0]);
                        console.log(parse[0]);
                      }
                      else
                      {
                        console.log('json is null: ', update.data.json)
                      }
                    }
                    else if (update.type == 'output')
                    {
                      processPercent = percent_data(processPercent);
                      vm.scripts[idx].progress = processPercent;
                      vm.scripts[idx].output.push(update.data.json);
                      //vm.output = update.data;
                    }
                  });
          }
        });
        // Percent Data figures out the percentage to place
        // keep percent lower than 100%
        function percent_data (current)
        {
          var currentPer = current;
          var top = 95;
          console.log(currentPer);
          if (currentPer < top)
          {
            currentPer = currentPer + 5
          }
          else
          {
            currentPer = currentPer;
          }
          return currentPer;
        }
        Runner.list()
          .then(
            function(data)
            {
              // Might Need to Parse it
              vm.scripts = data.json;
            });

    });
