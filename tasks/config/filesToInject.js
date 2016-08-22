/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
 * Files injected into index.html by gulp-inject
 * used by tasks inject & watch
 */

module.exports = [

  'client/app.js',
  'client/animations/*.js',
  'client/directives/**/*.js', '!client/directives/**/*.spec.js',
  'client/filters/**/*.js', '!client/filters/**/*.spec.js',
  'client/services/**/*.js', '!client/services/**/*.spec.js',
  'client/views/**/*.js', '!client/views/**/*.spec.js',
  '!client/views/**/*.e2e.js',

  'client/bower_components/ace-builds/src-min-noconflict/ext-language_tools.js',

  // custom text colors
  'client/services/mdColors/mdColors.js',

  // dont include hog-tracker
  '!client/services/hog-tracker/src/hog-tracker.directive.js',
];
