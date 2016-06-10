'use strict';

var gulp = require('gulp');
var nodeInspector = require('gulp-node-inspector');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

gulp.task('default',    ['serve']);
gulp.task('serve',      ['watch'],      require('./tasks/serve').nodemon);
gulp.task('watch',      ['inject'],     require('./tasks/watch'));
gulp.task('inject',     ['sass'],       require('./tasks/inject'));
gulp.task('sass',       ['extrafiles'], require('./tasks/sass'));
gulp.task('rpm',                        require('./tasks/rpm.js'));
gulp.task('sass',       ['extrafiles'], require('./tasks/sass'));
gulp.task('preview',    ['build'],      require('./tasks/preview'));
gulp.task('build',                      require('./tasks/build'));
gulp.task('bump',       ['version'],    require('./tasks/chore').bump);
gulp.task('version',                    require('./tasks/chore').version);
gulp.task('control',                    require('./tasks/control'));
gulp.task('e2e:update',                 require('./tasks/test').e2eUpdate);
gulp.task('e2e',        ['serve'],      require('./tasks/test').e2eTests);
gulp.task('test',                       require('./tasks/test').test);
gulp.task('extrafiles',                 require('./tasks/extrafiles'));
gulp.task('debug', function() {

  gulp.src([])
    .pipe(nodeInspector({
      debugPort: 5858,
      webHost: '0.0.0.0',
      webPort: 8080,
      saveLiveEdit: false,
      preload: true,
      inject: true,
      hidden: [],
      stackTraceLimit: 50,
      sslKey: '',
      sslCert: ''
    }));
});
gulp.task('migrate',                    require('./tasks/migrate'));