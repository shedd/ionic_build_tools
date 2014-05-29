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
var changed = require('gulp-changed');
var connect = require('gulp-connect');
var open = require("gulp-open");

// the source paths
var source_paths = {
  sass: ['./app/scss/**/*.scss'],
  css: ['./app/scss/**/*.css'],
  scripts: ['./app/js/**/*.js'],
  templates: ['./app/templates/**/*.html'],
  images: ['./app/img/**/*.*'],
  index_page: ['./app/index.html']
};
// the destination paths
var dest_paths = {
  css: './www/css/',
  scripts: './www/js/',
  templates: './www/templates/',
  images: './www/img/',
  root: './www/'
};
// the options used by gulp-open when booting the test server
var open_options = {
  url: "http://localhost:8080"
};

// gulp.task('default', ['sass']);

gulp.task('build-styles', function(done) {
  gulp.src(source_paths.sass)
    .pipe(changed(dest_paths.css))
    .pipe(sass())
    .pipe(gulp.dest(dest_paths.css))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(dest_paths.css))
    .on('end', done)
    .pipe(connect.reload());
  gulp.src(source_paths.css)
    .pipe(changed(dest_paths.css))
    .pipe(gulp.dest(dest_paths.css))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(dest_paths.css))
    .on('end', done)
    .pipe(connect.reload());
});

gulp.task('build-scripts', function() {
  gulp.src(source_paths.scripts)
    .pipe(changed(dest_paths.scripts))
    .pipe(preprocess())
    .pipe(gulp.dest(dest_paths.scripts))
    .pipe(connect.reload());
});

gulp.task('build-templates', function() {
  gulp.src(source_paths.templates)
    .pipe(changed(dest_paths.templates))
    .pipe(preprocess())
    .pipe(gulp.dest(dest_paths.templates))
    .pipe(connect.reload());
});

gulp.task('build-index', function() {
  gulp.src(source_paths.index_page)
    .pipe(changed(dest_paths.root))
    .pipe(preprocess())
    .pipe(gulp.dest(dest_paths.root))
    .pipe(connect.reload());
});

gulp.task('build-images', function() {
  gulp.src(source_paths.images)
    .pipe(changed(dest_paths.images))
    .pipe(gulp.dest(dest_paths.images))
    .pipe(connect.reload());
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

// start a livereload-enable server & open browser
gulp.task('run-server', function() {
  connect.server({
    root: 'www',
    livereload: true
  });
  gulp.src(dest_paths.root + "index.html")
  .pipe(open("", open_options));
});

gulp.task('watch-styles', function(){
  return gulp.watch(source_paths.sass, ['build-styles']);
});

gulp.task('watch-scripts', function(){
  return gulp.watch(source_paths.scripts, ['build-scripts']);
});

gulp.task('watch-templates', function(){
  return gulp.watch(source_paths.templates, ['build-templates']);
});

gulp.task('watch-index_page', function(){
  return gulp.watch(source_paths.index_page, ['build-index']);
});

gulp.task('watch-images', function(){
  return gulp.watch(source_paths.images, ['build-images']);
});

gulp.task('watch', function() {
  return runSequence([  'watch-styles',
                        'watch-scripts',
                        'watch-templates',
                        'watch-index_page',
                        'watch-images'
                      ]);
});

// compile then boot up the ionic livereload server
gulp.task('serve', function() {
  runSequence('compile-all', ['watch', 'run-server']);
});

gulp.task('build', function() {
  runSequence('compile-all', 'build-native');
  
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
  return gulp.src(source_paths.scripts)
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
