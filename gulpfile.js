var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
require('shelljs/global');
var preprocess = require('gulp-preprocess');
var runSequence = require('run-sequence');
var argv = require('yargs').argv;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
  sass: ['./app/scss/**/*.scss'],
  scripts: ['./app/js/**/*.js'],
  templates: ['./app/templates/**/*.html'],
  images: ['./app/img/**/*.*'],
  index_page: ['./app/index.html']
};

// gulp.task('default', ['sass']);

gulp.task('build-styles', function(done) {
  gulp.src('./app/scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('build-scripts', function() {
  gulp.src(paths.scripts)
    .pipe(preprocess())
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('build-templates', function() {
  gulp.src(paths.templates)
    .pipe(preprocess())
    .pipe(gulp.dest('./www/templates/'));
});

gulp.task('build-index', function() {
  gulp.src(paths.index_page)
    .pipe(preprocess())
    .pipe(gulp.dest('./www'));
});

gulp.task('build-images', function() {
  gulp.src(paths.images)
    .pipe(gulp.dest('./www/img/'));
});

gulp.task('build-native', function() {
  // do the ionic ios build
  if(argv.ios) {
    if (exec('ionic build ios').code !== 0) {
      echo('Error: iOS build failed');
      exit(1);
    }

  }
  // do the ionic android build
  if(argv.android) {
    if (exec('ionic build android').code !== 0) {
      echo('Error: Android build failed');
      exit(1);
    }
  }
});

gulp.task('run-emulator', function() {
  // start the ios emulator
  if(argv.ios) {
    if (exec('ionic emulate ios').code !== 0) {
      echo('Error: iOS run failed');
      exit(1);
    }

  }
  // start the android emulator
  if(argv.android) {
    if (exec('ionic emulate android').code !== 0) {
      echo('Error: Android run failed');
      exit(1);
    }
  }
});

// run all of the individual build processes
gulp.task('compile-all', function(callback) {
  runSequence(['build-scripts', 
               'build-styles',
               'build-templates',
               'build-index',
               'build-images'
              ],
               callback
            );
});

// start the ionic livereload server
gulp.task('run-server', function() {
  exec('ionic serve');
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['build-styles']);
  gulp.watch(paths.scripts, ['build-scripts']);
  gulp.watch(paths.templates, ['build-templates']);
  gulp.watch(paths.index_page, ['build-index']);
  gulp.watch(paths.images, ['build-images']);
});

// compile then boot up the ionic livereload server
gulp.task('serve', function() {
  runSequence('compile-all', 
              'run-server', 
              'watch');
});

gulp.task('build', function() {
  runSequence('compile-all', 
              'build-native');
  
  // should we trigger the emulator?
  if(argv.run) {
    runSequence('run-emulator');
  }
});

gulp.task('build-release', function() {
  echo('Error: this is unimplemented');
  exit(1);
});

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
