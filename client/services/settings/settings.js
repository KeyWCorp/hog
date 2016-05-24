'use strict';

angular.module('hog')
  .service('SettingsService',
    function ($q, $log, lodash, Setting)
    {
      var dserivce = $q.defer();
      Setting.then(
        function(res)
        {
          $log.debug('setting resolved: ', res);
        },
        function(err)
        {
          $log.error('settings error: ', err);
        },
        function(settingSocket)
        {
          $log.debug('settings socket: ', settingSocket);
          var Set = settingSocket;
        
          var service = {
            set: set,
            get: get,
            settings: all,
            list: list,
            create: create,
            getp: getp,
            update: update,
            destroy: destroy,
            save: update
          };
          var settings = {
            es: '',
            udfLoc: '',
            args: ['-x'],
            udfs: [{name: 'test', file:''}],
          }
          //return service;


          function set(setting, value)
          {
            if(!lodash.isUndefined(settings[setting]))
              settings[setting] = value;
          };
          function get(setting)
          {
            return lodash.isUndefined(settings[setting]) ? null : settings[setting];
          }
          function all()
          {
            return settings;
          }
          function save(data)
          {
            var deferred = $q.defer();
            Set.emit('save', data);
            Set.on('saved',
                function(indata)
                {
                    if(indata.id == data.id)
                    $log.debug('Set saved', data.name);
                    deferred.resolve(indata);
                });
            Set.on('error',
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
                    Set.emit('index');
                    $log.debug('requested index data');
                    Set.on('index',
                        function(data)
                        {
                            $log.debug('returned index with data: ', data);
                            deferred.resolve(data.json);
                        });
                    Set.on('error',
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

                    Set.emit('create', angular.toJson(procData));
                    Set.on('create',
                        function(data)
                        {
                            deferred.resolve(data);
                        });
                    Set.on('error',
                        function(err)
                        {
                            deferred.reject(err);
                        });
                    return deferred.promise;
                }
                function update(procData)
                {
                    var deferred = $q.defer();
                    Set.emit('update', {id: procData.id, obj: angular.toJson(procData)});
                    Set.on('update',
                        function(data)
                        {
                            deferred.resolve(data);
                        });
                    Set.on('error',
                        function(err)
                        {
                            deferred.reject(err);
                        });
                    return deferred.promise;
                }
                function destroy(id)
                {
                    var deferred = $q.defer();
                    Set.emit('destroy', id);
                    Set.on('destroy',
                        function(data)
                        {
                            deferred.resolve(data);
                        });
                    Set.on('error',
                        function(err)
                        {
                            deferred.reject(err);
                        });
                    return deferred.promise;
                }
                function getp(id)
                {
                    var deferred = $q.defer();
                    Set.emit('show', id);
                    Set.on('show',
                        function(data)
                        {
                            deferred.resolve(data);
                        });
                    Set.on('error',
                        function(err)
                        {
                            deferred.reject(err);
                        });
                    return deferred.promise;
                }
        dserivce.resolve(service);
    });
    return dserivce.promise;
    });
