# Ionic Build Tools

A template app using the Ionic Framework and AngularJS to demonstrate a set of Gulp build tools.

Before using, check the TODOs marked in the `gulpfile`.

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

Install the Node packages required:

    sudo npm install -g ionic
    sudo npm install -g cordova
    
    # if you want to run the iOS emulator, install the following dependency
    # NOTE: THIS REQUIRES XCode 5.1.1 WHICH REQUIRES OS X MAVERICKS
    # if you're not running the iOS simulator, you can skip this dependency
    sudo npm install -g ios-sim

    npm install

    # we also need a couple of local versions, so we have it available for the hooks/after_prepare
    npm install cordova
    npm install cordova-lib
    npm install gulp # we needed to run this to get the node binary installed

Install ImageMagick for icon processing:

    brew update
    brew install imagemagick --build-from-source

(We need to use the build from source option in Mac OS X Mavericks to get PNG support.  If that fails, see https://github.com/Homebrew/homebrew/issues/14325#issuecomment-45429003 )

Check to make sure that NPM modules are added to your path.  If not, and you installed Node via Homebrew, add this to your .zshrc/.bashrc:

    # add node_modules to path
    export PATH=$PATH:./node_modules/.bin

### Android Dependencies

* Install the Android SDK - download from: http://developer.android.com/sdk/index.html
* Extract the SDK and move the folder into `~/Development`
* Create a symlink to the extracted version:

        cd ~/Development
        ln -s adt-bundle-mac-x86_64-20140321 adt-bundle

* Add the SDK to your path - edit `.bash_profile` or `.zshrc` or similar:

        # add android dev tools to path
        export PATH=$PATH:~/Development/adt-bundle/sdk/platform-tools:~/Development/adt-bundle/sdk/tools

* Ensure Java is installed
* Install Ant through Homebrew:

        brew update
        brew install ant

* Create an emulator image:

        android create avd --name kitkat --target android-19

For help, see the Cordova Android Platform Guide: http://cordova.apache.org/docs/en/3.4.0/guide_platforms_android_index.md.html

## Building & Testing

### Build Targets

For the build commands, you can control the build target using the `BUILD_TARGET` environment variable, which switches between the development / staging / production environments.

See `app/js/config/config.js` to see some of the elements switched based on the build target.  Environment specific code is switched throughout the app using https://github.com/jas/gulp-preprocess 

The primary configuration the build target controls is the API hostname:

* **development**: `http://localhost:8080`
* **staging**: `http://staging.domain.com`
* **production**: `http://production.domain.com`

### Local Browser Testing

Run the default gulp task to build the application code, start the watch task, and load it on the local Ionic testing server with LiveReload enabled:

    BUILD_TARGET=development gulp

See more about testing here: http://ionicframework.com/docs/guide/testing.html

### Running Development Builds on Emulators

First, do a recompile:

    BUILD_TARGET=development gulp compile

**This will be combined back into the `build` command, but struggling with async/sync gulp tasks**

Kick-off the build for the platform you want to test:

    BUILD_TARGET=development gulp build --ios
    BUILD_TARGET=development gulp build --android

If you want to run the build on the platform's emulator, add the `--run` option:

    BUILD_TARGET=development gulp build --ios --run
    BUILD_TARGET=development gulp build --android --run

### Release Builds

This section is still in progress.

See more about publishing here: http://ionicframework.com/docs/guide/publishing.html

#### iOS

See http://docs.phonegap.com/en/edge/guide_platforms_ios_index.md.html

##### Compile the code

Compile the code & build for iOS, configured for the environment desired - do this before opening XCode:

For staging:

    gulp patch
    BUILD_TARGET=staging gulp compile --release
    BUILD_TARGET=staging gulp build --ios --release

For production:

    gulp patch
    BUILD_TARGET=production gulp compile --release
    BUILD_TARGET=production gulp build --ios --release

##### Setup iOS Device for Development

* Open the XCode project that Cordova generates
* Plug in your test device
* In the XCode Organizer window, click Use for Development
* XCode will prompt you to add the device to an iOS Developer account
* XCode will prompt you to generate a certificate

##### Deploy to Device

* Use the USB cable to plug the device into your Mac.
* Select the name of the project in the Xcode window's Scheme drop-down list.
* Select your device from the Device drop-down list. If it is plugged in via USB but still does not appear, press the Organizer button to resolve any errors.
* Press the Run button to build, deploy and run the application on your device.


#### Android

Follow these instructions to setup your device for testing: http://developer.android.com/tools/device.html

##### Setup Code Signing

Unless you are changing something, this has already been setup for you.

Generate a new key if needed:

    keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

With the details from the key you just generated, create an `ant.properties` file in `platforms/android` with the following content (as discussed here: http://stackoverflow.com/questions/20402818/build-android-release-apk-on-phonegap-3-x-cli/22979830#22979830):

    key.store=/Path/to/KeyStore/myapp-release-key.keystore
    key.alias=myapp

This will mean you'll be prompted for your keystore password during the build process.

##### Configure the keystore password

Create a `secure.properties` file in `platforms/android` to contain the keystore password.

The content of `secure.properties` should be the following (as discussed here http://stackoverflow.com/a/14765511/139934):

    key.store.password=<your keystore password>
    key.alias.password=<your alias password>

(This file is in the `.gitignore` and will NOT be checked into version control.)

This file is referenced in `platforms/android/custom_rules.xml`

##### Run the build

The release build has been scripted via Gulp to automate build cleaning.

For staging:

    gulp patch
    BUILD_TARGET=staging gulp compile --release
    BUILD_TARGET=staging gulp build --android --release

For production:

    gulp patch
    BUILD_TARGET=production gulp compile --release
    BUILD_TARGET=production gulp build --android --release

By default, the build output file ends up in the 'platforms/android/ant-build' directory already signed and aligned and ready to deploy.

The Gulp script copies the output apk to `./release_builds/` with the timestamp appended.

You can install this to your device using `adb` as follows:

    adb install -r ./release_builds/release.apk

#### Summarized Production Release Sequence

    gulp patch
    BUILD_TARGET=production gulp compile --release
    BUILD_TARGET=production gulp build --ios --release
    BUILD_TARGET=production gulp compile --release
    BUILD_TARGET=production gulp build --android --release


## Development

### Bump app versions

Every time a build is release, the app's versions should be bumped in the relevant files.

The following `gulp` commands have been implemented to bump the version.

The app is versioned with semantic versioning - please see http://semver.org

 * MAJOR ("major") version when you make incompatible API changes -- major: 1.0.0
 * MINOR ("minor") version when you add functionality in a backwards-compatible manner -- minor: 0.1.0
 * PATCH ("patch") version when you make backwards-compatible bug fixes. -- patch: 0.0.2
 * PRERELEASE ("prerelease") a pre-release version -- prerelease: 0.0.1-2

You can use the commands

    gulp patch     # makes v0.1.0 → v0.1.1
    gulp feature   # makes v0.1.1 → v0.2.0
    gulp release   # makes v0.2.1 → v1.0.0
    gulp prerelease # makes v0.2.1-2 → v1.0.0-2

### Android ADB Quick Reference

    adb devices     # see Android devices attached to system
    adb install <file.apk>     # install apk to device
    adb install -r <file.apk>   # replace existing file.apk while preserving data
    adb shell screenrecord --time-limit 10 /sdcard/demo.mp4   # take a screencast of device for 10 seconds
    adb pull /sdcard/demo.mp4       # retrieve file from device

### Resolving error 'Not an Android project'

If when running a Cordova command, you get an error like the following: `The provided path "/Code/.../platforms/android" is not an Android project.`

This is because `AndroidManifest.xml`, which is preprocessed for builds, does not currently exist in `./platforms/android`

Just run `gulp process-android-build-config --android` which will generate another version for you and you should be set.

### Installing New Dependencies

Currently, frontend dependencies (i.e. those loaded by Angular) are managed by Bower via `bower.json`.  Install new dependencies via Bower as follows:

    bower install dependency --save

Build dependencies (i.e. gulp) are managed by NPM via `package.json`.  Install new development dependencies via NPM as follows:

    npm install dependency --save-dev

### Lint your JavaScript code

JS-Hint is integrated into Gulp.  Run:

    gulp lint

### Customizing Ionic with SASS

See this guide on customizing Ionic using SASS: http://ionicframework.com/tutorials/customizing-ionic-with-sass/

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

# Troubleshooting

## XCode: Code Signing Failed: Check that the identity you selected is valid

It seems that XCode has real problems with directory structures in Resources.  Check the System Console because it seems that this is where the errors are spit out.

The one time this happened to me, a `node_modules` directory ended up getting caught in the `www/lib` directory from building a dependency.  Deleting this fixed the issue.  Don't forget to remove this from the platforms copy of the www directory, too.
