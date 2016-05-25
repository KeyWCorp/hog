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

  // custom text colors
  'client/services/mdColors/mdColors.js',

  // pig-flow
  '!client/services/pig-flow/server.js',
  '!client/services/pig-flow/app.js',
  '!client/services/pig-flow/pages/**/*.js',
  '!client/services/pig-flow/w.js',

  // hog-tracker
  '!client/services/hog-tracker/server.js',
  '!client/services/hog-tracker/app.js',
  '!client/services/hog-tracker/Gruntfile.js',
  '!client/services/hog-tracker/cker.js',
  '!client/services/hog-tracker/pages/**/*.js'
];
