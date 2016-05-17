'use strict'

var chalk = require("chalk");
var run = require("./index.js").run;
var trackTasks = require("./index.js").trackTasks;

// local
//var script_location = "/Users/kmcoxe/Documents/IPI/pig-parser/src/test.pig";
var script_location = "/Users/kmcoxe/Documents/IPI/test/test.pig";
//var script_location = "/Users/kmcoxe/Documents/IPI/pig-parser/src/other.pig";

// server
//var script_location = "/opt/kevins/pig-parser/src/test.server.pig";
//var script_location = "/opt/kevins/pig-parser/src/other.server.pig";
//var script_location = "/home/maparco/scripts/graph.pig";



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



/*
 * Function to output Logs
 */
function taskTracker (data)
{
  if (typeof data === "string")
  {
    console.log(chalk.magenta(data));
  }
  else
  {
    console.log(chalk.magenta(JSON.stringify(data, null, 2)));
  }
}




/*
 * Function to output Logs
 */
function finished ()
{
  console.log("FINISHED!");
}




// run the script
//trackTasks(["-x", "local"], script_location, stdOut, stdError, stdLog, taskTracker, finished);
run(["-x", "local"], script_location, stdOut, stdError, stdLog, finished);
