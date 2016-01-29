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
              var processCount = 0;
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
                            if (update.type == 'progress')
                            {
                              //process status
                              console.log(update.data);
                              vm.scripts[id].progress = update.data;



                            }
                            else if (update.type == 'log')
                            {
                                vm.log = update.data;
                            }
                        });
            }
        });

        Runner.list().then(
                function(data)
                {
                    // Might Need to Parse it
                    vm.scripts = data.json;
                });

    });
