'use strict';

angular.module('hog')
  .service('Settings',
    function ($q, $log, lodash, Setting)
    {
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
      return service;


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
        Settings.emit('save', data);
        Setting.on('saved',
            function(indata)
            {
                if(indata.id == data.id)
                $log.debug('Setting saved', data.name);
                deferred.resolve(indata);
            });
        Setting.on('error',
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
                Setting.emit('index');
                $log.debug('requested index data');
                Setting.on('index',
                    function(data)
                    {
                        $log.debug('returned index with data: ', data);
                        deferred.resolve(data.json);
                    });
                Setting.on('error',
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

                Setting.emit('create', angular.toJson(procData));
                Setting.on('create',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Setting.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function update(procData)
            {
                var deferred = $q.defer();
                Setting.emit('update', {id: procData.id, obj: angular.toJson(procData)});
                Setting.on('update',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Setting.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function destroy(id)
            {
                var deferred = $q.defer();
                Setting.emit('destroy', id);
                Setting.on('destroy',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Setting.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
            function getp(id)
            {
                var deferred = $q.defer();
                Setting.emit('show', id);
                Setting.on('show',
                    function(data)
                    {
                        deferred.resolve(data);
                    });
                Setting.on('error',
                    function(err)
                    {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
    });
