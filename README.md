# CamStreamerLib

Node.js helper library for CamStreamer ACAP applications.

The library is primarily developed for CamScripter Acap application running directly in Axis cameras.
Examples of CamScripter packages can be found at https://github.com/CamStreamer/CamScripterApp_examples

## Installation

```
npm install camstreamerlib
```

# Documentation for Node.js modules

-   [HttpServer](doc/HttpServer.md) is a module for processing HTTP requests in your scripts. It also automatically serves up the content from html directory or you can register paths which you can process by your own (e.g. http://$CAMERA_IP/local/camscripter/proxy/$MY_PACKAGE_NAME/control.cgi).
-   [CameraVapix](doc/CameraVapix.md) is a module to access Axis camera VAPIX interface.
-   [CamStreamerAPI](doc/CamStreamerAPI.md) is a module for easy control of video streaming in the CamStreamer ACAP application (RTMP, HLS, SRT and MPEG-TS protocols).
-   [CamOverlayAPI](doc/CamOverlayAPI.md) is a module to access CamOverlay HTTP interface.
-   [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md) is a module for easy control of CamOverlay drawing API. For more details on supported video overlay drawing functions see https://camstreamer.com/camoverlay-api1
-   [CamScripterAPICameraEventsGenerator](doc/CamScripterAPICameraEventsGenerator.md) is a module which allows generating events on an Axis camera. These events can be used for triggers in the Axis camera rule engine (events/actions). It is also an easy way how to integrate events and metadata in VMS systems which support Axis camera events.

## For Developers

### Publishing to npm repository

1. Update version in package.json and push it
2. Create git tag e.g. v1.2.4

-   `git tag v1.2.4`
-   `git push --tags`

3. Publish new version to npm

-   `npm publish ./dist`

4. Edit GitHub release form.

### Preparing a package to upload to CamScripter

If you want to create your own package and upload it to CamScripter App, you can use the script CreatePackage. It creates a zip file which contains all required files and directories in your package folder. The script accepts source code written either in JavaScript or TypeScript if the package has the correct structure (more information in https://github.com/CamStreamer/CamScripterApp_examples/#readme). To include this script in your package add the following lines in the file package.json:

```json
"scripts": {
    "create-package": "node node_modules/camstreamerlib/CreatePackage.js"
  }
```

By default, the zipped package does not contain node_modules directory. If you want to include it (required when uploading to CamScripter App on Axis camera), add `-includeNodeModules` or `-i` parameter.

If you need to exclude a file or directory add `-exlude` or `-e` parameter with comma separated list.

```json
"scripts": {
    "create-package": "node node_modules/camstreamerlib/CreatePackage.js -i -e=react"
}
```

### Breaking changes when moving from version 1.\*.* to 2.\*.*

- Renamed file HTTPRequest.ts to HttpRequest.ts
- Removed deprecated protocol attribute from all options objects (use tls instead).
- Removed RTSP
  > Previously CameraVapix.ts supported both WebSocket and RTSP.
  > Starting with version 2.0.0, it supports WebSocket only.
- Renamed CamOverlayDrawingAPI event msg to message.
- Drawing services extracted from CamOverlayAPI.ts to separate file.
  > Please read [CamOverlayAPI](doc/CamOverlayAPI.md) and [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md) for more information.
