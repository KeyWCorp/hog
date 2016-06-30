/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

var fs      = require('fs');
var _       = require('lodash');
var path    = require('path');
var Pigs    = require('./pig.model');
var logger  = require('../../config/logger.js');
var _ready  = false;
var Pig     = Pigs.Pig;
/* Set up response functions */
function handleError (socket, err) {
  return socket.emit('pig:error', {status: 500, json: err});
}
function buildResponse (statusCode, data)
{
  return {status: statusCode, json: data};
}

/* Load the objects */
/* Pig.load(
   function(err)
   {
   logger.error('Failed to load Pig collection with error [%s]', err);
   });*/

/* Set up messages */
exports.init = function (socket)
{
  logger.info('initializing pig controller')
  Pig.created = function(obj)
  {
    socket.emit('Pig:created', obj);
  }
  Pig.updated = function(obj)
  {
    socket.emit('Pig:updated', obj);
  }
  Pig.removed = function(obj)
  {
    socket.emit('Pig:removed', obj);
  }
  Pigs.init(
    function(err, db)
    {
      _ready = true;
    });
}
/**
 * Get list of Pig
 *
 * @param req
 * @param res
 */
exports.index = function (socket) {
  logger.debug('in index function')
    socket.on('index',
        function()
        {
          if (_ready)
          {
            console.log('Index requested');
            logger.debug('Index requested');
            Pig.find({})
              .then(
                function (pigs)
                {
                  //
                  console.log('index sent')

                  console.log(pigs);

                  /*
                   * convert array to object
                   */
                  var pigs_obj = _.keyBy(pigs, '_id');

                  socket.emit('index', buildResponse(200, pigs_obj));
                },
                function(err)
                {
                  if (err) { return handleError(socket, err); }
                });
          }
        });
};
/**
 * Get list of simple Pig
 *
 * @param req
 * @param res
 */
exports.simpleIndex = function (socket) {
  logger.debug('in index function')
    socket.on('simpleIndex',
        function()
        {
          if (_ready)
          {
            console.log('Index requested');
            logger.debug('Index requested');
            Pig.find({type: 'simple'})
              .then(
                function (pigs)
                {
                  //
                  console.log('index sent')

                  /*
                   * convert array to object
                   */
                  var pigs_obj = _.keyBy(pigs, '_id');

                  socket.emit('simpleIndex', buildResponse(200, pigs_obj));
                },
                function(err)
                {
                  if (err) { return handleError(socket, err); }
                });
          }
        });
};


/**
 * Get a single Pig
 *
 * @param req
 * @param res
 */
exports.show = function (socket) {
  socket.on('show',
      function(id)
      {
        console.log('in show for pig: ', id, _ready);
        if (_ready)
        {
          Pig.findOne({_id: id}, {populate: true})
            .then(
              function(obj)
              {
                //if (err) { return handleError(socket, err); }
                //logger.info('data for show: ', obj.toJSON());
                socket.emit('show', buildResponse(200, obj.toJSON()));
              },
              function(err)
              {
                logger.error(err);
                if (err) { return handleError(socket, err); }
              });
        }
      });
};


/**
 * Creates a new Pig in the DB.
 *
 * @param req
 * @param res
 */
exports.create = function (socket) {
  socket.on('create',
      function(data)
      {
        if (_ready)
        {
          var d = JSON.parse(data);
          d.version = d.version == '' ? null : d.version;
          console.log('d: ', d);
          var pig = Pig.create(d);
          console.log('pig: ', pig, ' data: ' , data);
          pig.diff({data: ''}, true);
          console.log(pig);
          pig.updateModified();
          pig.save()
            .then(
              function(obj)
              {
                console.log(obj);
              //if (err) { return handleError(socket, err); }
                socket.emit('server:create', buildResponse(201, obj.toJSON()));
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });
};


/**
 * Updates an existing Pig in the DB.
 *
 * @param req
 * @param res
 */
exports.update = function (socket)
{
  socket.on('update',
      function(data)
      {
        if (_ready)
        {
          console.log('updating', data.obj);
          var newData = JSON.parse(data.obj);
          console.log('json parsed: ', newData);
          Pig.findOne({_id: newData._id})
            .then(
              function(doc)
              {
                console.log('Found One: ', doc);
                if(newData.version != doc.version)
                {
                  console.log('new version: ', newData.version, 'Old version: ', doc.version);
                  doc.diff(doc, true, newData);
                }
                if(newData.name != doc.name)
                {
                  //console.log('updating before renaming');
                  //doc.update(newData);
                  console.log('renaming script to: ', newData.name);

                  var script_location = path.join(__dirname, '../../',  'scripts/pig/', newData.name +  '.pig');
                  console.log('script location 2: ', script_location);

                  newData.script_loc = script_location;

                  console.log('starting rename');
                  doc.rename(script_location)
                    .then(
                      function()
                      {
                        console.log('rename successful, updating')
                        doc.update(newData);
                        console.log('Saving');
                        doc.save()
                          .then(
                            function(obj)
                            {
                              console.log('finished updating', obj);
                              //if (err) { return handleError(socket, err); }
                              socket.emit('update', buildResponse(200, obj.toJSON()));
                            },
                            function(err)
                            {
                              if (err) { return handleError(socket, err); }
                            });
                      },
                      function(err)
                      {
                        if (err) { return handleError(socket, err); }
                      });
                }
                else
                {
                  doc.update(newData);
                  doc.save()
                    .then(
                      function(obj)
                      {
                        console.log('finished updating', obj);
                        //if (err) { return handleError(socket, err); }
                        socket.emit('update', buildResponse(200, obj.toJSON()));
                      },
                      function(err)
                      {
                        if (err) { return handleError(socket, err); }
                      });
                }
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });
};

/**
 * Deletes a Pig from the DB.
 *
 * @param req
 * @param res
 */
exports.destroy = function (socket) {
  socket.on('destroy',
      function(id)
      {
        if (_ready)
        {
          Pig.deleteOne({_id: id})
            .then(
              function(err)
              {
                //if (err) { return handleError(socket, err); }
                socket.emit('destroy', buildResponse(204, {}));
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });
};

/**
 * Runs a Pig.
 *
 * @param socket
 */
exports.run = function (socket) {
  socket.on('run',
      function(id)
      {
        if (_ready)
        {
          Pig.findOne({_id: id})
            .then(
              function(doc)
              {
                doc.run(
                  // stdoutCB
                  function(data)
                  {
                    socket.emit('run:output', buildResponse(200, data));
                  },
                  // stderrCB
                  function(err)
                  {
                    if (err) { return handleError(socket, err); }
                  },
                  // stdlogCB
                  function(data)
                  {
                    socket.emit('run:log', buildResponse(200, data));
                  },
                  // stdwarningCB
                  function(data)
                  {
                    socket.emit('run:warning', buildResponse(200, data));
                  },
                  // finishedCB
                  function(data)
                  {
                    socket.emit('run:end');
                    socket.emit('run:finished');
                  },
                  // killCB
                  function(pig)
                  {
                    socket.on('kill',
                        function (kill_id)
                        {
                          if (id === kill_id)
                          {
                            pig.kill();

                            console.log("\n\nKilled script....");

                            socket.emit('run:end');
                            socket.emit('run:finished');
                          }
                        });
                  });
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });
};

/**
 * Runs a Pig and tracks it
 *
 * @param socket
 */
exports.runAndTrack = function (socket) {
  socket.on('run:track',
      function(id)
      {
        if (_ready)
        {
          Pig.findOne({_id: id})
            .then(
              function(doc)
              {
                doc.runAndTrack(
                  // stdoutCB
                  function(data)
                  {
                    socket.emit('run:output', buildResponse(200, data));
                  },
                  // stderrCB
                  function(err)
                  {
                    if (err) { return handleError(socket, err); }
                  },
                  // stdlogCB
                  function(data)
                  {
                    socket.emit('run:log', buildResponse(200, data));
                  },
                  // stdwarningCB
                  function(data)
                  {
                    socket.emit('run:warning', buildResponse(200, data));
                  },
                  // trackerCB
                  function(data)
                  {
                    socket.emit('tracker:update', data);
                  },
                  // finishedCB
                  function(data)
                  {
                    socket.emit('run:end');
                    socket.emit('run:finished');
                  },
                  // killCB
                  function(pig)
                  {
                    socket.on('kill',
                        function (kill_id)
                        {
                          if (id === kill_id)
                          {
                            pig.kill();

                            console.log("\n\nKilled script....");

                            socket.emit('run:end');
                            socket.emit('run:finished');
                          }
                        });
                  });
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });

};
/**
 * Gets a list of the most recently changed scripts up to the limit passed in
 *
 * @param socket
 */
exports.getRecent = function (socket) {
  socket.on('recent',
    function(countntype)
    {
      Pig.find({type: countntype.type}, {populate: ['name'], limit: countntype.count, sort: '-lastModified'})
        .then(
            function(docs)
            {
              console.log('count: ', countntype.count, 'type: ', countntype.type, 'docs: ', docs);
              socket.emit('recents-'+countntype.type, buildResponse(200, docs));
            },
            function(err)
            {
              if (err) { return handleError(socket, err); }
            });
    })
};

/**
 * bumps the pigs version
 *
 * @param socket
 */
exports.bumpVersion = function(socket)
{
  socket.on('bump',
    function(id)
    {
      if (_ready)
      {
        console.log('finding and bumping', id);
        Pig.findOne({_id: id})
          .then(
            function(doc)
            {
              console.log(id, 'found attempting bump');

              var ver = doc.bump();

                    console.log('finished bumping version', ver);
                    //if (err) { return handleError(socket, err); }
                    socket.emit('bumped', buildResponse(200, ver));

            },
            function(err)
            {
              if (err) { return handleError(socket, err); }
            });
      }
    });
}

