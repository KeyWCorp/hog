// AUTHOR: Billy Davies
// COMPANY: KEYW Corp.
// CODED ON: 06/02/2016
'use strict';
// Required utilities to package an RPM.
var gutil       = require('gulp-util');
var _           = require('lodash');
var wrench      = require('wrench');
var exec        = require('child_process').exec;
var path        = require('path');
var gulp        = require('gulp');
var npm         = require('gulp-brass-npm');
var brass       = require('gulp-brass');
var rimraf      = require('rimraf');
var runSequence = require('run-sequence');
var async       = require('async');

var pkg, options, rpm;
// Reference the package.json for all the files needed to build.
// This will provide all the naming scheme, versioning, description,
// and the node packages needed to install the app.
pkg = require('../package.json');
options = npm.getOptions(pkg);
// Installation directory for the app.
options.installDir = '/usr/lib/'+options.name;
// The apps license. ISC is shorter but basically identical to MIT.
options.license = 'ISC';
// Metadata for the package information, if you have this information
// from the package.json file then you use options.<term>
options.service = {
  type          : 'systemd',
  name          : options.name,
  summary       : 'A web based PIG IDE platform',
  description   : 'This project aims to provide a useful web based wrapper for Apache PIG.',
  exec          : '/usr/bin/hog',
  user          : 'KEYW/User',
  group         : 'Applications/service'
};
// Create the final object to package.
rpm = brass.create(options);

// module.exports section here:
// You can change the sequence to whatever you want,
// build will call all the options in the correct order.
// Anything you pull before build will call things in the correct
// order.
module.exports = function(done) {
  runSequence(
      ['build'],
      done);
};
// Removes the brass_build directory.
// Don't remove this if you don't have to, becauseif the
// directories exist then it will cause some issues with duplication.
gulp.task('clean', function (callback) {
  rimraf(rpm.buildDir, callback);
});
// To prep for making the rpm, clean the directory.
gulp.task('rpm-setup', [ 'clean' ], rpm.setupTask());
// Call npm to package the appropriate files to the appropriate build
// directories for preperation for the creation of the RPM.
gulp.task('npm-pack', [ 'rpm-setup' ], function (callback) {
  async.series([
    function (callback) {
      exec('npm pack '+ rpm.options.cwd, { cwd: rpm.buildDir_SOURCES }, callback);
    }, function (callback) {
        var archive;

        archive = options.name +'-'+ options.version +'.tgz';
        archive = path.join(rpm.buildDir_SOURCES, archive);
        exec('tar xvzf '+ archive +' --strip-components=1 -C '+ rpm.buildDir_BUILD, callback);

      }, function (callback) {
          process.env.NODE_ENV = 'production';
          exec('npm install', {
            env: process.env,
            cwd: rpm.buildDir_BUILD
          }, callback);
        }
    ], callback);
});
// Creates the remaining glob files so that the spec file appropriately
// places the app specefic files in the RPM as well.
gulp.task('rpm-files', [ 'rpm-setup', 'npm-pack' ], function () {
  var globs = [
    'client/**/*',
    'server/**/*',
    'gulpfile.js',
    'tasks/**/*',
    'package.json',
    'bower.json',
    'karma.conf.js',
    'protractor.conf.js',
    'README.md'
  ];
  // buildRoot is where the app will build itself once it unpacks,
  // You will have to change if you want the package to unpack
  // elsewhere.
  return gulp.src(globs, rpm.globOptions)
  .pipe(gulp.dest(path.join(rpm.buildRoot, '/opt/hog')))
  .pipe(rpm.files());
});
// Creates the rpm service so that you can call
// the package via systemd calls.
gulp.task('rpm-service', [ 'rpm-setup' ], function () {
  return gulp.src(brass.util.assets('service/systemd'))
  .pipe(brass.util.template(options.service))
  .pipe(brass.util.rename(options.service.name +'.service'))
  .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
  .pipe(rpm.files());
});
// Creates a symlink between the tmp directory and the spec file
// so the app will unpack correctly.
gulp.task('rpm-binaries', [ 'rpm-files' ], function () {
  return gulp.src(path.join(rpm.buildRoot, '/opt/hog/bin/hog'))
  .pipe(brass.util.symlink(path.join(rpm.buildRoot, '/usr/bin/hog')))
  .pipe(rpm.files());
});
// Generates the spec file based on what is put into the tmp/ directory.
gulp.task('rpm-spec', [ 'rpm-files', 'rpm-binaries' ], rpm.specTask());
// Builds the rpm
gulp.task('rpm-build', [ 'rpm-setup', 'npm-pack', 'rpm-files', 'rpm-binaries', 'rpm-service', 'rpm-spec' ], rpm.buildTask());
// Builds the rpm, with a console feed so that you can determine
// if the app built itself correctly.
gulp.task('build', [ 'rpm-build' ], function () {
  console.log('build finished');
});
