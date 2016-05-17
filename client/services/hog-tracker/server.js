'use strict';

var fs = require('fs'); //for image upload file handling

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var chalk = require('chalk');

var pigParser = require('pig-parser');

// =============================================================================
// Start server info
// =============================================================================
var port = 3000;
var host = 'localhost';
var serverPath = '/';
var staticPath = '/';
// =============================================================================
// End server info
// =============================================================================

// =============================================================================
// Start Socket.io
// =============================================================================


/*
 * Function to output stdOut
 */
function stdOut(data)
{
  if (typeof data === "string")
  {
    console.log(chalk.green(data));
  }
  else
  {
    console.log(chalk.green(JSON.stringify(data, null, 2)));
  }
}



/*
 * Function to output stdErr
 */
function stdError(data)
{
  if (typeof data === "string")
  {
    console.log(chalk.red(data));
  }
  else
  {
    console.log(chalk.red(JSON.stringify(data, null, 2)));
  }
}



/*
 * Function to output Logs
 */
function stdLog(data)
{
  if (typeof data === "string")
  {
    console.log(chalk.cyan(data));
  }
  else
  {
    console.log(chalk.cyan(JSON.stringify(data, null, 2)));
  }
}

io.on('connection',
    function(socket)
    {
      socket.on("run",
          function ()
          {
            var script_location = "/Users/kmcoxe/Documents/IPI/pig-parser/src/test.pig";
            //var script_location = "/opt/kevins/hog-tracker/node_modules/pig-parser/src/test.pig";

            function taskTracker (task_list) {
              socket.emit('update', task_list);
            };

            function test (d) {};

            function finished ()
            {
              socket.emit('finish');
            }

            console.log("running...");
            //pigParser.trackTasks(script_location, test, test, test, taskTracker);
            pigParser.trackTasks(script_location, stdOut, stdError, stdLog, taskTracker, finished);
          });
    });


// =============================================================================
// End Socket.io
// =============================================================================




// =============================================================================
// Start routes
// =============================================================================
var staticFilePath = __dirname + serverPath;
// remove trailing slash if present
if (staticFilePath.substr(-1) === '/')
{
  staticFilePath = staticFilePath.substr(0, staticFilePath.length - 1);
}

app.configure(function ()
{
  // compress static content
  app.use(express.compress());
  app.use(serverPath, express.static(staticFilePath)); //serve static files

  app.use(express.bodyParser()); //for post content / files - not sure if this is actually necessary?
});

//catch all route to serve index.html (main frontend app)
app.get('/', function (req, res)
{
  res.sendfile(staticFilePath + staticPath + 'index.html');
});



// =============================================================================
// End routes
// =============================================================================

server.listen(port);

console.log('Server running at http://' + host + ':' + port.toString() + '/');
