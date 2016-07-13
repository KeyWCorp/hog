/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

/**
 * Check if all the files are where they belong.
 */

var gulp                 = require('gulp');
var runSequence          = require('run-sequence');

module.exports = function(done) {
  runSequence('ace-files',
      done);
};

gulp.task('ace-files', function() {
  return gulp.src('client/externals/mode-pig_latin.js')
             .pipe(gulp.dest('client/bower_components/ace-builds/src-min-noconflict/'));
});
