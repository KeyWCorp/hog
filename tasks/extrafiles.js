'use strict';

/**
 * Check if all the files are where they belong.
 */

var gulp       = require('gulp');

module.exports = {
  copyfiles: function(){
    return (
    gulp.src('../client/externals/mode-pig_latin.js')
      .pipe(gulp.dest('../client/bower_components/ace-builds/src-min-noconflict/')));
  }
};
