'use strict';

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

pkg = require('../package.json');
options = npm.getOptions(pkg);
options.installDir = '/usr/lib/'+options.name;
options.license = 'ISC';
options.service = {
  type          : 'systemd',
  name          : options.name,
  summary       : 'A web based PIG IDE platform',
  description   : 'This project aims to provide a useful web based wrapper for Apache PIG.',
  exec          : '/usr/bin/hog',
  user          : 'KEYW/User',
  group         : 'Applications/service'
};

rpm = brass.create(options);

// module.exports section here:
module.exports = function(done) {
  runSequence(
      ['build'],
      done);
};

gulp.task('clean', function (callback) {
  rimraf(rpm.buildDir, callback);
});

gulp.task('rpm-setup', [ 'clean' ], rpm.setupTask());

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

gulp.task('rpm-files', [ 'rpm-setup', 'npm-pack' ], function () {
  var globs = [
    'node_modules/**/*',
    'client/**/*',
    'server/**/*',
    'gulpfile.js',
    'tasks/**/*',
    'package.json',
    'bower.json'
  ];

  return gulp.src(globs, rpm.globOptions)
  .pipe(gulp.dest(path.join(rpm.buildRoot, '/opt/hog')))
  .pipe(rpm.files());
});

gulp.task('rpm-service', [ 'rpm-setup' ], function () {
  return gulp.src(brass.util.assets('service/systemd'))
  .pipe(brass.util.template(options.service))
  .pipe(brass.util.rename(options.service.name +'.service'))
  .pipe(gulp.dest(path.join(rpm.buildRoot, '/lib/systemd/system')))
  .pipe(rpm.files());
});

gulp.task('rpm-binaries', [ 'rpm-files' ], function () {
  return gulp.src(path.join(rpm.buildRoot, '/opt/hog/bin/hog'))
  .pipe(brass.util.symlink(path.join(rpm.buildRoot, '/usr/bin/hog')))
  .pipe(rpm.files());
});

gulp.task('rpm-spec', [ 'rpm-files', 'rpm-binaries' ], rpm.specTask());

gulp.task('rpm-build', [ 'rpm-setup', 'npm-pack', 'rpm-files', 'rpm-binaries', 'rpm-service', 'rpm-spec' ], rpm.buildTask());

gulp.task('build', [ 'rpm-build' ], function () {
  console.log('build finished');
});
