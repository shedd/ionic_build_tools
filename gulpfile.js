var gulp = require('gulp')
var gutil = require('gulp-util')
var bower = require('bower')
var sass = require('gulp-sass')
var cleanCSS = require('gulp-clean-css')
var rename = require('gulp-rename')
require('shelljs/global')
var preprocess = require('gulp-preprocess')
var runSequence = require('run-sequence')
var argv = require('yargs').argv
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var changed = require('gulp-changed')
var connect = require('gulp-connect')
var open = require('gulp-open')
var clean = require('gulp-clean')
var moment = require('moment')
var bump = require('gulp-bump')
var semver = require('semver')
var git = require('gulp-git')
var filter = require('gulp-filter')
var tag_version = require('gulp-tag-version')
var Q = require('q')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps')
var watchify = require('watchify')
var plumber = require('gulp-plumber')
var babel = require('gulp-babel')

const ifaces = require('os').networkInterfaces()

// the source paths
var source_paths = {
  sass: ['./app/scss/**/*.scss'],
  css: ['./app/scss/**/*.css'],
  fonts: ['./app/fonts/*'],
  scripts: ['./app/js/**/*.js'],
  bundle: './www/js/app.js',
  templates: ['./app/templates/**/*.html'],
  images: ['./app/img/**/*.*'],
  index_page: ['./app/index.html']
}
// the destination paths
var dest_paths = {
  css: './www/css/',
  fonts: './www/fonts/',
  scripts: './www/js/',
  bundle: './www/dist/',
  templates: './www/templates/',
  images: './www/img/',
  index_page: './www/index.html',
  root: './www/',
  release_builds: './release_builds'
}

var lookupIpAddress = null
for (var dev in ifaces) {
  if (dev !== 'en1' && dev !== 'en0' && dev !== 'en5') {
    continue
  }
  ifaces[dev].forEach(function (details) {
    if (details.family === 'IPv4') {
      lookupIpAddress = details.address
    }
  })
}
const ipAddress = lookupIpAddress
if (ipAddress === undefined) {
  exit(1)
}
// the options used by gulp-open when booting the test server
var open_options = {
  port: 8000,
  host: 'http://localhost'
}

gulp.task('default', function () {
  runSequence('compile', 'serve')
})

// /////////////////////////////////////////////////////
// COMPILATION TASKS
// /////////////////////////////////////////////////////

gulp.task('compile-sass', function () {
  return gulp.src(source_paths.sass)
    .pipe(changed(dest_paths.css))
    .pipe(sass())
    .pipe(gulp.dest(dest_paths.css))
    .pipe(cleanCSS({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(dest_paths.css))
    .pipe(connect.reload())
})

gulp.task('compile-css', function () {
  return gulp.src(source_paths.css)
    .pipe(changed(dest_paths.css))
    .pipe(gulp.dest(dest_paths.css))
    .pipe(cleanCSS({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(dest_paths.css))
    .pipe(connect.reload())
})

gulp.task('compile-fonts', function () {
  return gulp.src(source_paths.fonts)
    .pipe(changed(dest_paths.fonts))
    .pipe(gulp.dest(dest_paths.fonts))
    .pipe(connect.reload())
})

gulp.task('copy-scripts', function () {
  return gulp.src(source_paths.scripts)
    .pipe(changed(dest_paths.scripts))
    .pipe(preprocess({ context: { IP_ADDRESS: ipAddress } }))
    .pipe(gulp.dest(dest_paths.scripts))
})

gulp.task('browserify', ['copy-scripts'], function () {
  return browserify(source_paths.bundle, {
    debug: true,
    transform: ['debowerify']
  })
    .external('angular')
    .external('ionic')
    .bundle().on('error', gutil.log)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(dest_paths.bundle))
})
gulp.task('compile-scripts', ['browserify'], function () {
  return gulp.src(dest_paths.bundle)
    .pipe(connect.reload())
})

gulp.task('compile-templates', function () {
  return gulp.src(source_paths.templates)
    .pipe(changed(dest_paths.templates))
    .pipe(preprocess())
    .pipe(gulp.dest(dest_paths.templates))
    .pipe(connect.reload())
})

gulp.task('compile-index', function () {
  return gulp.src(source_paths.index_page)
    .pipe(changed(dest_paths.root))
    .pipe(preprocess({context: {RELEASE: argv.release}}))
    .pipe(gulp.dest(dest_paths.root))
    .pipe(connect.reload())
})

gulp.task('compile-images', function () {
  return gulp.src(source_paths.images)
    .pipe(changed(dest_paths.images))
    .pipe(gulp.dest(dest_paths.images))
    .pipe(connect.reload())
})

// compile resources (icons)
gulp.task('compile-resources', function () {
  return exec('ionic resources')
})

gulp.task('compile-all', [
  'compile-scripts',
  'compile-sass',
  'compile-css',
  'compile-fonts',
  'compile-templates',
  'compile-index',
  'compile-images',
  'compile-resources'
])

// compile everything after cleaning the build
gulp.task('compile', ['build-clean'], function () {
  var deferred = Q.defer()

  runSequence('compile-all', function () {
    deferred.resolve()
  })

  return deferred.promise
})

// /////////////////////////////////////////////////////
// CLEAN TASKS
// /////////////////////////////////////////////////////

gulp.task('clean-styles', function () {
  return gulp.src(dest_paths.css, {read: false})
    .pipe(clean({force: true}))
})

gulp.task('clean-images', function () {
  return gulp.src(dest_paths.images, {read: false})
    .pipe(clean({force: true}))
})

gulp.task('clean-scripts', function () {
  return gulp.src(dest_paths.scripts, {read: false})
    .pipe(clean({force: true}))
})

gulp.task('clean-templates', function () {
  return gulp.src(dest_paths.templates, {read: false})
    .pipe(clean({force: true}))
})

gulp.task('clean-index', function () {
  return gulp.src(dest_paths.index_page, {read: false})
    .pipe(clean({force: true}))
})

gulp.task('build-clean', [
  'clean-scripts',
  'clean-styles',
  'clean-templates',
  'clean-images',
])

// /////////////////////////////////////////////////////
// WATCH TASKS
// /////////////////////////////////////////////////////

gulp.task('watch-sass', function () {
  return gulp.watch(source_paths.sass, ['compile-sass'])
})

gulp.task('watch-css', function () {
  return gulp.watch(source_paths.css, ['compile-css'])
})

gulp.task('watch-fonts', function () {
  return gulp.watch(source_paths.fonts, ['compile-fonts'])
})
gulp.task('watch-scripts', function () {
  return gulp.watch(source_paths.scripts, ['compile-scripts'])
})

gulp.task('watch-templates', function () {
  return gulp.watch(source_paths.templates, ['compile-templates'])
})

gulp.task('watch-index_page', function () {
  return gulp.watch(source_paths.index_page, ['compile-index'])
})

gulp.task('watch-images', function () {
  return gulp.watch(source_paths.images, ['compile-images'])
})

gulp.task('watch', function () {
  runSequence([ 'watch-sass',
    'watch-css',
    'watch-scripts',
    'watch-templates',
    'watch-index_page',
    'watch-images'
  ])
})

// /////////////////////////////////////////////////////
// LOCAL SERVER TASKS
// /////////////////////////////////////////////////////

// start a livereload-enable server after compiling
// TODO: add 'compile' back as a dependency when sync/async issues fixed
gulp.task('run-server', [], function () {
  return connect.server({
    root: 'www',
    port: open_options.port,
    livereload: true
  })
})

// open browser after starting server
gulp.task('open-browser', ['run-server'], function () {
  const url = open_options.host + ':' + open_options.port
  return gulp.src(dest_paths.root + 'index.html')
    .pipe(open('', {url: url}))
})

// compile then boot up the ionic site in a browser
gulp.task('serve', ['open-browser', 'watch'])

// /////////////////////////////////////////////////////
// BUILD TASKS
// /////////////////////////////////////////////////////

// set the debuggable flag in the AndroidManifest.xml for release or debug
// move the manifest file into the build path
gulp.task('process-android-build-config', function () {
  if (!argv.android) {
    return false
  }

  var srcManifestFile = ['./lib/AndroidManifest.xml']
  var destManifestFile = './platforms/android/'
  return gulp.src(srcManifestFile)
    .pipe(preprocess({context: {RELEASE: argv.release}}))
    .pipe(gulp.dest(destManifestFile))
})

// build a debug native version after compiling
// TODO: add 'compile' back as a dependency when sync/async issues fixed
gulp.task('build-debug', ['process-android-build-config'], function () {
  // do the ionic ios build
  if (argv.ios) {
    if (exec('ionic build ios').code !== 0) {
      echo('Error: iOS build failed')
      exit(1)
    }
  }
  // do the ionic android build
  if (argv.android) {
    if (exec('ionic build android').code !== 0) {
      echo('Error: Android build failed')
      exit(1)
    }
  }
})

// build for deploying to attached device
gulp.task('build-device', ['process-android-build-config'], function () {
  // do the ionic ios build
  if (argv.ios) {
    if (exec('ionic build ios --device').code !== 0) {
      echo('Error iOS device build failed')
      exit(1)
    }
  }
// FIXME: do android device build
})

// build a release native version after compiling
// TODO: add 'compile' back as a dependency when sync/async issues fixed
gulp.task('build-release', ['process-android-build-config'], function () {
  // remove the console plugin
  exec('cordova plugin rm org.apache.cordova.console')

  // do the ionic ios build
  if (argv.ios) {
    if (exec('cordova build --release ios').code !== 0) {
      echo('Error: iOS build failed')
      exit(1)
    }
  }

  // do the ionic android build
  if (argv.android) {
    // clean the android build folders:
    gulp.src('./platforms/android/ant-build/', {read: false})
      .pipe(clean({force: true}))
    gulp.src('./platforms/android/ant-gen/', {read: false})
      .pipe(clean({force: true}))
    gulp.src('./platforms/android/out/', {read: false})
      .pipe(clean({force: true}))

    if (exec('cordova build --release android').code !== 0) {
      echo('Error: Android build failed')
      exit(1)
    } else {
      // copy the release output to release-builds/
      // TODO: change the below to match your expected release filename
      return gulp.src(['./platforms/android/ant-build/release.apk'])
        .pipe(rename(function (path) {
          // see https://github.com/hparra/gulp-rename for info on rename fields
          path.basename += moment().format('MMDDYYYY-hhmmss')
        }))
        // do any other processing needed
        .pipe(gulp.dest(dest_paths.release_builds))
    }
  }

// re-add the console plugin
// exec("cordova plugin add org.apache.cordova.console")
})

// fire up the emulator, depending on what flags passed
gulp.task('run-emulator', function () {
  // should we trigger the emulator?
  if (!argv.run) {
    return false
  }

  // start the ios emulator
  if (argv.ios) {
    if (exec('ionic emulate ios').code !== 0) {
      echo('Error: iOS run failed')
      exit(1)
    }
  }

  // start the android emulator
  if (argv.android) {
    if (exec('ionic emulate android').code !== 0) {
      echo('Error: Android run failed')
      exit(1)
    }
  }
})

// deploy to a device, if 'device' given
gulp.task('run-device', function () {
  // should we trigger the device?
  if (!argv.run) {
    return false
  }

  // deploy to connected IOS device
  if (argv.ios) {
    if (exec('ios-deploy --debug --bundle platforms/ios/build/device/IPED.app --no-wifi').code !== 0) {
      echo('Error: ios device run failed')
      exit(1)
    }
  }

// FIXME: figure out for android
})

gulp.task('build', function () {
  // are we building a debug or release version?
  // force a compile so any important changes (BUILD_TARGET, say)
  // will be correct in deployed files
  if (argv.release) {
    runSequence('compile', 'build-release', 'run-emulator')
  } else if (argv.device) {
    runSequence('compile', 'build-device', 'run-device')
  } else {
    runSequence('compile', 'build-debug', 'run-emulator')
  }
})

// /////////////////////////////////////////////////////
// MISC TASKS
// /////////////////////////////////////////////////////

// used for bumping versions and getting the version info
// `fs` is used instead of require to prevent caching in watch (require caches)
var fs = require('fs')
var getPackageJson = function () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'))
}

/**
 * Bumping version number and tagging the repository with it.
 *
 * Semantic versioning bump
 * Please read http://semver.org/
 * **************************************************
 * MAJOR ("major") version when you make incompatible API changes -- major: 1.0.0
 * MINOR ("minor") version when you add functionality in a backwards-compatible manner -- minor: 0.1.0
 * PATCH ("patch") version when you make backwards-compatible bug fixes. -- patch: 0.0.2
 * PRERELEASE ("prerelease") a pre-release version -- prerelease: 0.0.1-2
 * **************************************************
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *     gulp prerelease # makes v0.2.1-2 → v1.0.0-2
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
function inc (importance) {
  var deferred = Q.defer()
  // reget package
  var pkg = getPackageJson()
  // get existing version
  var oldVer = pkg.version
  // increment version
  var newVer = semver.inc(oldVer, importance)
  // json filter
  var jsonFilter = filter('**/*.json')

  // TODO: change /platforms/ios/project/ in the below to match your Cordova project name

  // bump the version number in the xml config files
  replacement = 'sed -i \'\' -e \'s/version="' + oldVer + '"/version="' + newVer + '"/\' ./config.xml'
  exec(replacement)
  replacement2 = 'sed -i \'\' -e \'s/version="' + oldVer + '"/version="' + newVer + '"/\' ./platforms/ios/project/config.xml'
  exec(replacement2)
  replacement3 = 'sed -i \'\' -e \'s/android:versionName="' + oldVer + '"/android:versionName="' + newVer + '"/\' ./lib/AndroidManifest.xml'
  exec(replacement3)

  // get all the files to bump version in
  gulp.src(['./package.json', './bower.json', './config.xml', './platforms/ios/project/config.xml', './lib/AndroidManifest.xml'])
    // filter only the json files
    .pipe(jsonFilter)
    // bump the version number in the json files
    .pipe(bump({version: newVer}))
    // save json files back to filesystem
    .pipe(gulp.dest('./'))
    // restore full stream
    .pipe(jsonFilter.restore())
    // commit the changed version number
    .pipe(git.commit('bump app version to ' + newVer))
    // read only one file to get the version number
    .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tag_version())

  return deferred.promise
}

gulp.task('patch', function () { return inc('patch'); })
gulp.task('feature', function () { return inc('minor'); })
gulp.task('release', function () { return inc('major'); })
gulp.task('prerelease', function () { return inc('prerelease'); })

// run source scripts through JSHint
gulp.task('lint', function () {
  return gulp.src(source_paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
})

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
    .on('log', function (data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message)
    })
})

gulp.task('git-check', function (done) {
  if (!which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      "\n  Once git is installed, run '" + gutil.colors.cyan('gulp install') + "' again."
    )
    process.exit(1)
  }
  done()
})
