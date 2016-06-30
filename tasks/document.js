'use strict';

/**
 * Compile Documentation
 */

var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var _       = require('lodash');
var as      = require('async');
var runSequence          = require('run-sequence');
 var jsdoc = require('gulp-jsdoc3');
 var docco = require("gulp-docco");
//var exec = require('gulp-exec');
var exec = require('child_process').exec;
var options = {
    continueOnError: false, // default = false, true means don't emit error event 
    pipeStdout: false, // default = false, true means stdout is written to file.contents 
    //customTemplatingThing: "test" // content passed to gutil.template() 
  };
  var reportOptions = {
  	err: true, // default = true, false means don't write err 
  	stderr: true, // default = true, false means don't write stderr 
  	stdout: true // default = true, false means don't write stdout 
  }

module.exports = function (done) {
    runSequence(
    'comment', 'jsDoc', 'docco',
    done);
};
gulp.task('comment', function(done)
{
    function comment(p, cb)
    {
        exec('smartcomments -g -c smartcomments.json -t ' + p, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
    as.each(['server', 'client/services', 'client/views'], comment, done);
});
gulp.task('jsDoc', function(cb)
{
    var config = require('./config/jsdoc.json');
    gulp.src(['README.md', './server/**/*.js', './client/services/**/*.js', './client/views/**/*.js'], {read: false})
        .pipe(jsdoc(config, cb));
});
gulp.task('docco', function()
{
    gulp.src(['README.md', './server/**/*.js', './client/services/**/*.js', './client/views/**/*.js'])
        .pipe(docco())
        .pipe(gulp.dest('docs/code'));
});