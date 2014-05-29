# Ionic Build Tools

A template app using the Ionic Framework and AngularJS to demonstrate a set of Gulp build tools.

## Repo Structure

A brief tour of the repository:

* `app/`
    * `img/` - the application's images
    * `js/` - the application's scripts
    * `scss/` - the application's scripts
    * `templates/` - the AngularJS templates
    * `index.html` - the AngularJS application loader
* `www/` - this is the build output directory that Ionic injects into the Cordova applications.  You shouldn't be editing anything in this directory.  The contents are overwritten by the Gulp build process.
    * `lib/` - this is one exception to the above - Bower installs frontend dependencies directly into www/lib

## Installing Dependencies

Install the packages required:

    sudo npm install -g ionic
    sudo npm install -g cordova
    sudo npm install -g ios-sim
    npm install

## Building & Testing

### Build Targets

For the build commands, you can control the build target using the `BUILD_TARGET` environment variable, which switches between the development / staging / production environments.

See `app/js/config/config.js` to see some of the elements switched based on the build target.  Environment specific code is switched throughout the app using https://github.com/jas/gulp-preprocess 

The primary configuration the build target controls is the API hostname:

* **development**: `http://localhost:8080`
* **staging**: `http://staging.domain.com`
* **production**: `http://production.domain.com`

### Local Browser Testing

Run the following command to build the application code, start the watch task, and load it on the local Ionic testing server with LiveReload enabled:

    BUILD_TARGET=development gulp serve 

See more about testing here: http://ionicframework.com/docs/guide/testing.html

### Running Development Builds on Emulators

Kick-off the build for the platform you want to test:

    BUILD_TARGET=development gulp build --ios
    BUILD_TARGET=development gulp build --android

If you want to run the build on the platform's emulator, add the `--run` option:

    BUILD_TARGET=development gulp build --ios --run
    BUILD_TARGET=development gulp build --android --run

### Release Builds

This is TODO.

See more about publishing here: http://ionicframework.com/docs/guide/publishing.html


## Development

### Lint your JavaScript code

JS-Hint is integrated into Gulp.  Run:

    gulp lint

### Updating Ionic

To update to a new version of Ionic, open bower.json and change the version listed there.

For example, to update from version `1.0.0-beta.4` to `1.0.0-beta.5`, open bower.json and change this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.4"
```

To this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.5"
```

After saving the update to bower.json file, run `gulp install`.

Alternatively, install bower globally with `npm install -g bower` and run `bower install`.

#### Using the Nightly Builds of Ionic

If you feel daring and want use the bleeding edge 'Nightly' version of Ionic, change the version of Ionic in your bower.json to this:

```
"ionic": "driftyco/ionic-bower#master"
```

Warning: the nightly version is not stable.
