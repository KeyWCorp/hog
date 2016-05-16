'use strict'

var spawn = require('child_process').spawn;
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');


/*
 *
 *
 *
 *
 */
function run(input_args, script_location, stdOut, stdError, stdLog, finishedCallback)
{
  var pig_args = input_args;
  pig_args.push.apply(pig_args, [script_location]);

  var pig = spawn('pig', pig_args,
  {
    env: process.env
  });

  var re;
  var variable_info;

  /*
   * Function to get the stdOut
   * return output
   *
   */
  pig.stdout.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");
      data_list.forEach(
        function (data)
        {
          if (data.match(/\([\s\S]+\)/g))
          {
            stdOut(data)
          }
          //if (re)
          //{
          //  var match = data.match(re);
          //  if (match)
          //  {
          //    var tmp_output = {};
          //    for (var i = 1; i < match.length; i++)
          //    {
          //      tmp_output[variable_info.matches[i - 1].label] = match[i];
          //    }
          //    stdOut(tmp_output);
          //    output_list.push(tmp_output);
          //  }
          //}
        });
    });

  /*
   * Function for getting stdErr
   * return logs and errors
   *
   */
  pig.stderr.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");

      var warn_re = /^[\s\S]*WARN[\s\S]*$/gm;
      var info_re = /^[\s\S]*INFO[\s\S]*$/gm;
      var task_re = /(\d+-\d+-\d+)\s(\d+:\d+:\d+),(\d+)\s\[([a-z]*)\]\s([A-Z]+)\s*((?:[a-zA-Z]|\d|\.)+)\s-\s((?:\w|\W)+)/;

      data_list.forEach(
        function (data)
        {
          var warn_match = data.match(warn_re);
          if (warn_match)
          {
            stdError(decoder.write(chunk));
          }
          else
          {
            var info_match = data.match(info_re);
            if (info_match)
            {
              stdLog(data);

              //if (task_list)
              //{
              //  var task_match = data.match(task_re);
              //  if (task_match)
              //  {
              //    var task_name = task_match[6];
              //    var task_status = task_match[7];
              //    var map_match = task_name.match(/((?:[a-zA-Z]|\d|\.)+\.MapReduceLauncher)/);
              //    var tmp_status = "pending";
              //    var task_percent;
              //    if (task_status.match(/\s*(?:success|complete|fail|%)\s*/i))
              //    {
              //      if (task_status.match(/\%/))
              //      {
              //        var percentage_match = task_status.match(/(\d{1,3})\%[\s\S]*/);
              //        task_percent = Number(percentage_match[1])
              //        tmp_status = "RUNNING";
              //      }
              //      else if (task_status.match(/(?:success|complete)/i))
              //      {
              //        tmp_status = "FINISHED";
              //      }
              //      else
              //      {
              //        tmp_status = "FAILED";
              //      }
              //      task_list.forEach(
              //        function (task_item, i)
              //        {
              //          if (task_item.variable == variable_info.variable)
              //          {
              //            var t = task_item;
              //            t.status = tmp_status;
              //            t.percentage = task_percent;
              //            task_list[i] = t;
              //          }
              //        });
              //      taskTracker(task_list);
              //    }
              //  }
              //}
            }

          }
        });
    });

  /*
   * Function to know when the script
   * is done running
   *
   */
  pig.on("close",
    function (code)
    {
      finishedCallback();
    });

}



// =============================================================================
// Start Track Tasks
// =============================================================================
/*
 *
 *
 *
 */
function trackTasks(input_args, script_location, stdOut, stdError, stdLog, taskTracker, finished_callback)
{

  var output_script_location = script_location + ".pig";

  fs.readFile(script_location, 'utf8',
    function (err, data)
    {
      if (err)
      {
        return stdError(err);
      }

      var task_list = [];
      var dump_re = /^\s*([A-Z]+)\s+(?!\=)([\s\S]+)\s*;\s*$/;

      var data_lines = data.split("\n");
      var end_lines = data.split("\n");

      var data_offset = 0;
      var command_lines = [];

      for (var i = 0; i < data_lines.length; i++)
      {
        var line = data_lines[i];
        var match = line.match(dump_re);
        if (match)
        {

          var line = match[0];
          var command = match[1];
          var variable = match[2];

          if (!command.match(/((?:DUMP|DEFINE))/g))
          {
            end_lines.splice(i - data_offset, 1);
            data_offset += 1;
          }
          else if (!command.match(/((?:DEFINE))/g))
          {
            end_lines.splice(i - data_offset, 1);
            data_offset += 1;
            command_lines.push(
            {
              line_number: i,
              line: line,
              command: command,
              variable: variable,
              file_location: output_script_location
            });
          }

        }
      };

      var i = 0;
      var j = 0;
      /*
       *
       *
       */
      function runSynchronously(i)
      {
        if (command_lines[i])
        {
          writeRunTrack(input_args, end_lines, command_lines[i],
            function (taskObject)
            {
              var task = {
                id: i + 1,
                status: "pending",
                variable: taskObject.variable,
                parent: i
              };

              task_list.push(task);

              taskTracker(task_list);

              i++;
              if (i < command_lines.length)
              {
                runSynchronously(i);
              }
              else
              {
                getOutputSynchronously(j);
              }

            }, stdOut, stdError, stdLog);
        }
      }
      runSynchronously(i);


      /*
       *
       *
       */
      function getOutputSynchronously(j)
      {
        if (command_lines[j])
        {
          writeAndRun(end_lines, command_lines[j],
            function ()
            {
              j++;
              if (j < command_lines.length)
              {
                getOutputSynchronously(j);
              }
              else
              {
                finished_callback();
              }
            }, stdOut, stdError, stdLog, taskTracker, task_list);
        }
      }

    });
}



/*
 *
 *
 */
function writeRunTrack(input_args, output_list, command, callback, stdOut, stdError, stdLog)
{
  var final_regex = {};

  var new_output = output_list.slice(0);
  //var describe_command = "DESCRIBE " + command.variable + ";";
  var describe_command = "EXPLAIN " + command.variable + ";";
  new_output.splice(command.line_number, 0, describe_command);

  var output_data = new_output.join("\n");
  var new_file_name = command.file_location + command.variable;

  var stream = fs.createWriteStream(new_file_name);
  stream.once("open",
    function (fd)
    {
      stream.write(output_data);
      stream.end();
    });

  stream.once("close",
    function ()
    {
      pigGetTasks(input_args, new_file_name,
        function (count)
        {
          fs.unlink(new_file_name,
            function (err)
            {
              if (err) throw err;
            });
          callback(
          {
            variable: command.variable,
            count: count
          });
        }, stdOut, stdError, stdLog);
    });
}




/*
 *
 *
 */
function pigGetTasks(input_args, script_location, callback, stdOut, stdError, stdLog)
{

  var map_plan_re = /^\#\sMap\sReduce\sPlan\s*$/;
  var map_count = 0;

  var pig_args = input_args;
  pig_args.push.apply(pig_args, [script_location]);

  var pig = spawn('pig', pig_args,
  {
    env: process.env
  });

  var re;
  var variable_info;

  /*
   * Function to get the stdOut
   * return output
   *
   */
  pig.stdout.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");
      data_list.forEach(
        function (data)
        {
          var map_plan_match = data.match(map_plan_re);

          if (map_plan_match)
          {
            map_count++;
            //stdOut(data);
          }
        });
    });

  /*
   * Function for getting stdErr
   * return logs and errors
   *
   */
  pig.stderr.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");

      var warn_re = /^[\s\S]*WARN[\s\S]*$/gm;
      var info_re = /^[\s\S]*INFO[\s\S]*$/gm;

      data_list.forEach(
        function (data)
        {
          var warn_match = data.match(warn_re);
          if (warn_match)
          {
            stdError(decoder.write(chunk));
          }
          else
          {
            var info_match = data.match(info_re);
            if (info_match)
            {
              //stdLog(data);
            }

          }
        });
    });

  /*
   * Function to know when the script
   * is done running
   *
   */
  pig.on("close",
    function (code)
    {
      callback(map_count);
    });
}
// =============================================================================
// End Task Traker
// =============================================================================




/*
 * Function for creating the new
 * script and running it.
 *
 * When script is done it will
 * delete the file
 *
 */
function writeAndRun(output_list, command, callback, stdOut, stdError, stdLog, taskTracker, task_list)
{
  var final_regex = {};

  var new_output = output_list.slice(0);
  var describe_command = "DESCRIBE " + command.variable + ";" + command.line;
  new_output.splice(command.line_number, 0, describe_command);

  var output_data = new_output.join("\n");
  var new_file_name = command.file_location + command.variable;

  var stream = fs.createWriteStream(new_file_name);
  stream.once("open",
    function (fd)
    {
      stream.write(output_data);
      stream.end();
    });

  stream.once("close",
    function ()
    {
      pigGetOutput([new_file_name],
        function (output_obj)
        {
          fs.unlink(new_file_name,
            function (err)
            {
              if (err) throw err;
            });
          callback(output_obj);
        }, stdOut, stdError, stdLog, taskTracker, task_list);
    });
}




/*
 * Function to run the pig script
 *
 */
function pigGetOutput(input_args, callback, stdOut, stdError, stdLog, taskTracker, task_list)
{

  var output_list = [];
  var describeList = [];
  var describe_re = /^(\S+):\s*(\{(?:[\s\S]+:)+[\s\S]+\})$/;

  var pig_args = ['-x', 'local'];
  pig_args.push.apply(pig_args, input_args);

  var pig = spawn('pig', pig_args,
  {
    env: process.env
  });

  var re;
  var variable_info;

  /*
   * Function to get the stdOut
   * return output
   *
   */
  pig.stdout.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");
      data_list.forEach(
        function (data)
        {
          var describe_match = data.match(describe_re);

          if (describe_match)
          {
            var tmp_describe_obj = {
              variable: describe_match[1],
              description: describe_match[2]
            }

            variable_info = describeToRegex(tmp_describe_obj);

            re = variable_info.regex;

            describeList.push(variable_info);
          }
          else
          {
            if (re)
            {
              var match = data.match(re);
              if (match)
              {
                var tmp_output = {};

                for (var i = 1; i < match.length; i++)
                {
                  tmp_output[variable_info.matches[i - 1].label] = match[i];
                }
                stdOut(tmp_output);
                output_list.push(tmp_output);
              }
            }
          }
        });
    });

  /*
   * Function for getting stdErr
   * return logs and errors
   *
   */
  pig.stderr.on("data",
    function (chunk)
    {
      var data_list = decoder.write(chunk).split("\n");

      var warn_re = /^[\s\S]*WARN[\s\S]*$/gm;
      var info_re = /^[\s\S]*INFO[\s\S]*$/gm;
      var task_re = /(\d+-\d+-\d+)\s(\d+:\d+:\d+),(\d+)\s\[([a-z]*)\]\s([A-Z]+)\s*((?:[a-zA-Z]|\d|\.)+)\s-\s((?:\w|\W)+)/;

      data_list.forEach(
        function (data)
        {
          var warn_match = data.match(warn_re);
          if (warn_match)
          {
            stdError(decoder.write(chunk));
          }
          else
          {
            var info_match = data.match(info_re);
            if (info_match)
            {
              stdLog(data);

              if (task_list)
              {
                var task_match = data.match(task_re);
                if (task_match)
                {
                  var task_name = task_match[6];
                  var task_status = task_match[7];
                  var map_match = task_name.match(/((?:[a-zA-Z]|\d|\.)+\.MapReduceLauncher)/);
                  var tmp_status = "pending";
                  var task_percent;

                  if (task_status.match(/\s*(?:success|complete|fail|%)\s*/i))
                  {
                    if (task_status.match(/\%/))
                    {
                      var percentage_match = task_status.match(/(\d{1,3})\%[\s\S]*/);
                      task_percent = Number(percentage_match[1])
                      tmp_status = "RUNNING";
                    }
                    else if (task_status.match(/(?:success|complete)/i))
                    {
                      tmp_status = "FINISHED";
                    }
                    else
                    {
                      tmp_status = "FAILED";
                    }

                    task_list.forEach(
                      function (task_item, i)
                      {
                        if (task_item.variable == variable_info.variable)
                        {
                          var t = task_item;
                          t.status = tmp_status;
                          t.percentage = task_percent;
                          task_list[i] = t;
                        }
                      });

                    taskTracker(task_list);
                  }
                }
              }
            }

          }
        });
    });

  /*
   * Function to know when the script
   * is done running
   *
   */
  pig.on("close",
    function (code)
    {
      callback();
    });
}
// =============================================================================
// End Run and Output
// =============================================================================




/*
 * Function that takes in the output
 * from the 'DESCRIBE' command
 * and returns a JSON describtion
 * and regex
 *
 */
function describeToRegex(describe_input)
{
  var return_obj = {
    variable: describe_input.variable,
    matches: []
  };
  var description_obj = describe_input.description;

  // get labels
  var labels_raw_list = description_obj.replace(/(?:\{|\})/g, '').split(",");
  for (var i = 0; i < labels_raw_list.length; i++)
  {
    var item = labels_raw_list[i];
    var match = item.match(/(\w+):\s(\w+)/);
    return_obj.matches.push(
    {
      label: match[1],
      type: match[2]
    });
  };


  // generate regex
  var n = description_obj.split(",").length;
  var return_re = "\\(";
  for (var i = 0; i < n; i++)
  {
    return_re += "((?:[\\s\\S]|\\.)+)";
    if (i + 1 < n)
    {
      return_re += ",";
    }
    else
    {
      return_re += "\\)";
    }
  };

  return_obj.regex = new RegExp(return_re);
  return return_obj;
};

// Module exports
module.exports.run = run
module.exports.trackTasks = trackTasks;

