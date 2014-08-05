#!/bin/bash
# Generate PhoneGap icon and splash screens
# Based on https://gist.github.com/LinusU/7515016
# and https://github.com/tlvince/phonegap-icon-splash-generator

# devices=android,bada,bada-wac,blackberry,ios,webos,windows-phone
devices=android,ios
eval mkdir -p "{icons,screens}/{$devices}"

# Show the user some progress by outputing all commands being run.
set -x

# base file to use for the icons
ICON="base-icon.png"
# base file to use for the splash screens
SPLASH="base-splash.png"
# background color to use for the splash screens
BGCOLOR="#FFFFFF"

# address warning: convert: iCCP: Not recognizing known sRGB profile that has been edited 
convert $ICON -strip $ICON
convert $SPLASH -strip $SPLASH

# ICON GENERATION
# Explicitly set background in case image is transparent (see: #3)
convert="convert -background none"

# test to see whether the icons will change at all
$convert $ICON -resize 36x36 "temp.png"
DIFF=`compare -metric RMSE icons/android/icon-36-ldpi.png temp.png NULL: 2>&1`
NOCHANGE="0 (0)"
if [ "$DIFF" != "$NOCHANGE" ]
  then
    echo 'Icon has changed'

    $convert $ICON -resize 36x36 "icons/android/icon-36-ldpi.png"
    $convert $ICON -resize 72x72 "icons/android/icon-72-hdpi.png"
    $convert $ICON -resize 48x48 "icons/android/icon-48-mdpi.png"
    $convert $ICON -resize 96x96 "icons/android/icon-96-xhdpi.png"
    $convert $ICON -resize 29x29 "icons/ios/icon-29.png"
    convert $ICON -resize 58 "icons/ios/icon-29-2x.png"
    $convert $ICON -resize 40x40 "icons/ios/icon-40.png"
    $convert $ICON -resize 50x50 "icons/ios/icon-50.png"
    $convert $ICON -resize 57x57 "icons/ios/icon-57.png"
    $convert $ICON -resize 58x58 "icons/ios/icon-58.png"
    convert $ICON -resize 60 "icons/ios/icon-60.png"
    $convert $ICON -resize 72x72 "icons/ios/icon-72.png"
    $convert $ICON -resize 76x76 "icons/ios/icon-76.png"
    $convert $ICON -resize 80x80 "icons/ios/icon-80.png"
    $convert $ICON -resize 80 "icons/ios/icon-40-2x.png"
    $convert $ICON -resize 100 "icons/ios/icon-50-2x.png"
    $convert $ICON -resize 114 "icons/ios/icon-57-2x.png"
    $convert $ICON -resize 120 "icons/ios/icon-60-2x.png"
    $convert $ICON -resize 144 "icons/ios/icon-72-2x.png"
    $convert $ICON -resize 152 "icons/ios/icon-76-2x.png"
    $convert $ICON -resize 100x100 "icons/ios/icon-100.png"
    $convert $ICON -resize 144x144 "icons/ios/icon-144.png"
    $convert $ICON -resize 114x114 "icons/ios/icon-114.png"
    $convert $ICON -resize 120x120 "icons/ios/icon-120.png"
    $convert $ICON -resize 152x152 "icons/ios/icon-152.png"
    # $convert "$1" -resize 128x128 "icon/icon.png"
    # $convert "$1" -resize 128x128 "$3/res/icon/bada/icon-128.png"
    # $convert "$1" -resize 48x48 "$3/res/icon/bada-wac/icon-48-type5.png"
    # $convert "$1" -resize 80x80 "$3/res/icon/bada-wac/icon-80-type4.png"
    # $convert "$1" -resize 50x50 "$3/res/icon/bada-wac/icon-50-type3.png"
    # $convert "$1" -resize 80x80 "$3/res/icon/blackberry/icon-80.png"
    # $convert "$1" -resize 64x64 "$3/res/icon/webos/icon-64.png"
    # $convert "$1" -resize 48x48 "$3/res/icon/windows-phone/icon-48.png"
    # $convert "$1" -resize 173x173 "$3/res/icon/windows-phone/icon-173-tile.png"
    # $convert "$1" -resize 62x62 "$3/res/icon/windows-phone/icon-62-tile.png"
  else
    echo 'Icon has not changed'
fi
rm 'temp.png'


# # SPLASH SCREEN GENERATION
convert="convert $SPLASH -background $BGCOLOR -gravity center"

# test to see whether the splash screen will change at all
$convert -resize 512x512 -extent 1280x720 "temp.png"
DIFF=`compare -metric RMSE screens/android/screen-xhdpi-landscape.png temp.png NULL: 2>&1`
NOCHANGE="0 (0)"
if [ "$DIFF" != "$NOCHANGE" ]
  then
    echo 'Splash screen has changed'

    $convert -resize 512x512 -extent 1280x720 "screens/android/screen-xhdpi-landscape.png"
    $convert -resize 256x256 -extent 480x800 "screens/android/screen-hdpi-portrait.png"
    $convert -resize 128x128 -extent 320x200 "screens/android/screen-ldpi-landscape.png"
    $convert -resize 512x512 -extent 720x1280 "screens/android/screen-xhdpi-portrait.png"
    $convert -resize 256x256 -extent 320x480 "screens/android/screen-mdpi-portrait.png"
    $convert -resize 256x256 -extent 480x320 "screens/android/screen-mdpi-landscape.png"
    $convert -resize 128x128 -extent 200x320 "screens/android/screen-ldpi-portrait.png"
    $convert -resize 512x512 -extent 800x480 "screens/android/screen-hdpi-landscape.png"
    # iPhone
    $convert -resize 256x256 -extent 320x480 "screens/ios/screen-iphone-portrait.png"
    $convert -resize 512x512 -extent 960x640 "screens/ios/screen-iphone-landscape-2x.png"
    $convert -resize 256x256 -extent 480x320 "screens/ios/screen-iphone-landscape.png"
    $convert -resize 512x512 -extent 640x960 "screens/ios/screen-iphone-portrait-2x.png"
    $convert -resize 512x512 -extent 640x1136 "screens/ios/screen-iphone-portrait-568h-2x.png"
    # iPad - iOS7+
    $convert -resize 512x512 -extent 768x1024 "screens/ios/screen-ipad-portrait.png"
    $convert -resize 1024x1024 -extent 1536x2048 "screens/ios/screen-ipad-portrait-2x.png"
    $convert -resize 512x512 -extent 1024x768 "screens/ios/screen-ipad-landscape.png"
    $convert -resize 1024x1024 -extent 2048x1536 "screens/ios/screen-ipad-landscape-2x.png"
    # iPad - iOS6
    # $convert -resize 512x512 -extent 768x1004 "screens/ios/screen-ipad-portrait_ios6.png"
    # $convert -resize 1024x1024 -extent 1536x2008 "screens/ios/screen-ipad-portrait-2x_ios6.png"
    # $convert -resize 512x512 -extent 1024x748 "screens/ios/screen-ipad-landscape_ios6.png"
    # $convert -resize 1024x1024 -extent 2048x1496 "screens/ios/screen-ipad-landscape-2x_ios6.png"
    # Other platforms
    # $convert -resize 256x256 -extent 480x800 "$3/res/screens/bada/screen-portrait.png"
    # $convert -resize 128x128 -extent 320x480 "$3/res/screens/bada-wac/screen-type3.png"
    # $convert -resize 256x256 -extent 480x800 "$3/res/screens/bada-wac/screen-type4.png"
    # $convert -resize 128x128 -extent 240x400 "$3/res/screens/bada-wac/screen-type5.png"
    # $convert -resize 256x256 -extent 480x800 "$3/res/screens/bada-wac/screen-type5.png"
    # $convert -resize 128x128 -extent 225x225 "$3/res/screens/blackberry/screen-225.png"
    # convert "$1" -resize 64x64 "$3/res/screens/webos/screen-64.png"
    # $convert -resize 256x256 -extent 480x800 "$3/res/screens/windows-phone/screen-portrait.jpg"
  else
    echo 'Splash screen has not changed'
fi
rm 'temp.png'
