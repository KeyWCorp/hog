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
            run: function(id)
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

                           console.log(update.type);

                           if (update.type == 'end') {
                              vm.scripts[id].progress = 100;
                           }
                            else if (update.type == 'progress')
                            {
                              //process status
                              processPercent = percent_data(processPercent);

                               vm.scripts[id].progress = update.data;
                              //   vm.scripts[id].progress = processPercent;

                            }
                            else if (update.type == 'log')
                            {
                                processPercent = percent_data(processPercent);
                              //  vm.scripts[id].progress = processPercent;
                                vm.log = update.data;
                            }
                        });
            }
        });
        // Percent Data figures out the percentage to place
        // keep percent lower than 100%
        function percent_data (current) {
          var currentPer = current;
          var top = 95;
          console.log(currentPer);
          if (currentPer < top) {
              currentPer = currentPer + 5

          } else {
             currentPer = currentPer;
          }


          return currentPer;
        }


        Runner.list().then(
                function(data)
                {
                    // Might Need to Parse it
                    vm.scripts = data.json;
                });

    });
