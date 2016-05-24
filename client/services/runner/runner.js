'use strict';

angular.module('hog')
.service('RunnerService',
    function (Pig, $rootScope, $log, $q, uuid4)
    {
      var dpig = $q.defer();
      var holdData = {};
      Pig.then(
        function(info)
        {
          $log.debug('resolved: ', info);
        },
        function(err)
        {
          $log.debug('errored: ', err);
        },
        function(newPig)
        {
          Pig = newPig;
          $log.debug('new pig as arrived', Pig, newPig);
          
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
            getData: getData,
            update: update,
            destroy: destroy,
            run: run,
            runAndTrack: runAndTrack,
            save: update,
            finished: finished,
            trackUpdate: trackUpdate
          };
        

      //Added by Rick to try and pass object
      function getData()
      {
        var temp =   list()
          .then(
              function(data)
              {
                // Might Need to Parse it
                var script = data.json;
                ////      console.log(script);
              });
        return temp;
      }
      function trackUpdate()
      {
        var defer = $q.defer();
        Pig.on('track:update',
          function (data)
          {
            defer.notify(data);
          });
        return $q.promise;
      }
      function finished()
      {
        var defer = $q.defer();
        
        Pig.on('run:finished',
          function ()
          {
            defer.notify(true);
          });
        return $q.promise;
      }
      
      function save(data)
      {
        console.log(' IN RUNNER SAVE FUNCTION');
        var deferred = $q.defer();
        Pig.emit('save', data);
        Pig.on('saved',
            function(indata)
            {
              if(indata._id == data._id)
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
        //console.log('LSDJFLSDJFLSDKfj');
        var deferred = $q.defer();
        Pig.emit('index');
        $log.debug('requested index data');
        Pig.on('index',
            function(data)
            {
              $log.debug('returned index with data: ', data);

              deferred.notify({type: 'list', data: data});
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
        console.log('in create ' + JSON.stringify(procData));
        console.log(typeof(procData));
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
        Pig.on('server:create',
            function(data)
            {
              deferred.resolve(data);
              deferred.notify({type: 'create', data: data});
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
        //    console.log(' in UPDATET' + JSON.stringify(procData));
        holdData = procData;
        var deferred = $q.defer();
        Pig.emit('update', {id: procData._id, obj: angular.toJson(procData)});
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
              deferred.resolve({type: 'end', data: data});
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
        Pig.on('run:output',
            function(output)
            {
              deferred.notify({type: 'output', data: output});
            });
        Pig.on('error',
            function(err)
            {
              deferred.notify({type: 'error', data: err});
            });

        return deferred.promise;
      }
      function runAndTrack(id)
      {
        var deferred = $q.defer();
        Pig.emit('run:track', id);
        Pig.on('run:end',
            function(data)
            {
              //deferred.notify({type: 'end', data: data});
              deferred.resolve({type: 'end', data: data});
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
        Pig.on('run:output',
            function(output)
            {
              deferred.notify({type: 'output', data: output});
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
        console.log('in createProc');
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
      dpig.resolve(service);
    })
    return dpig.promise;
  });
