'use strict';

angular.module('hog')
  .service('Runner',
        function (Pig, $rootScope, $log, $q, uuid4)
        {
            $rootScope.$on('pig-error',
                function(msg)
                {
                    console.log('error-msg', msg);
            });
            var args = [];
            var processes = {};
            var service = {
                process: list,
                procList: processes,
                args: args,
               // send: sendData,
               // create: createProc,
                list: list,
                create: create,
                get: get,
                update: update,
                destroy: destroy,
                run: run,
                save: update
            };

            return service;

            function save(data)
            {
                var deferred = $q.defer();
                Pig.emit('save', data);
                Pig.on('saved',
                    function(indata)
                    {
                        if(indata.id == data.id)
                        $log.debug('Script saved', data.name);
                        deferred.resolve(indata);
                    });
                Pig.on('error',
                    function(err)
                    {
                        $log.debug('error in saving data: ', err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function list()
            {
                var deferred = $q.defer();
                Pig.emit('index');
                $log.debug('requested index data');
                Pig.on('index',
                    function(data)
                    {
                        $log.debug('returned index with data: ', data);
                        deferred.resolve(data);
                    });
                Pig.on('error',
                    function(err)
                    {
                        $log.debug('error in index data: ', err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function create(procData)
            {
                var deferred = $q.defer();
                /*var id = uuid4.generate();
                processes[id] = {
                    args: args,
                    data: data,
                    pCB: procCB,
                    uCB: updCB,
                    eCB: endCB,
                    id: id
                };*/
                Pig.emit('create', angular.toJson(procData));
                Pig.on('create',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Pig.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function update(procData)
            {
                var deferred = $q.defer();
                Pig.emit('update', {id: procData.id, obj: angular.toJson(procData)});
                Pig.on('update',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Pig.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function destroy(id)
            {
                var deferred = $q.defer();
                Pig.emit('destroy', id);
                Pig.on('destroy',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Pig.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function get(id)
            {
                var deferred = $q.defer();
                Pig.emit('show', id);
                Pig.on('show',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Pig.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function run(id)
            {
                var deferred = $q.defer();
                Pig.emit('run', id);
                Pig.on('run:end',
                    function(data)
                    {
                        console.log('end promise');
                        deferred.resolve(data);
                    });
                Pig.on('run:progress',
                    function(percent)
                    {
                        deferred.notify({type: 'progress', data: percent});
                    });
                Pig.on('run:log',
                    function(log)
                    {
                        deferred.notify({type: 'log', data: log});
                    });
                Pig.on('error',
                    function(err)
                    {
                    deferred.notify({type: 'error', data: err});
                        //deferred.reject(err);
                    });

                return deferred.promise;
            }
            function createProc(args, data, procCB, updCB, endCB)
            {
                var id = uuid4.generate();
                processes[id] = {
                    args: args,
                    data: data,
                    pCB: procCB,
                    uCB: updCB,
                    eCB: endCB,
                    id: id
                };

                Pig.emit('execute', {id: id, args: args, data: data});
                Pig.on('update',
                    function(d)
                    {
                        if(uuid4.vaildate(d.id))
                        {
                            processes[d.id].uCB(d);
                        }
                    });
                Pig.on('progress',
                    function(d)
                    {
                        if(uuid4.validate(d.id) && angular.isDefined(processes[d.id]))
                        {
                            processes[d.id].pCB(d);
                        }
                    });
                Pig.on('close',
                    function(d)
                    {
                        if(uuid4.vaildate(d.id))
                        {
                            processes[d.id].eCB(d);
                        }
                    });
            }
        });
