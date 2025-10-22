# CamStreamerLib - BETA

**This is beta version of CamStreamerLib v4, dont use it on production. Is going to be changed significantly.**

**The documentation is in progress**

Node.js helper library for CamStreamer ACAP applications.

The library is primarily developed for the CamScripter ACAP application running directly in Axis cameras.
Examples of CamScripter packages can be found at https://github.com/CamStreamer/CamScripterApp_examples

## Installation

```
npm install camstreamerlib
```

## Documentation for ACAP and Camera API

| API                                                | Description                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [VapixAPI](doc/VapixAPI.md)                        | Module to access Axis camera VAPIX interface.                                                                          |
| [CamStreamerAPI](doc/CamStreamerAPI.md)            | Module for easy control of video streaming in the CamStreamer ACAP application (RTMP, HLS, SRT and MPEG-TS protocols). |
| [CamOverlayAPI](doc/CamOverlayAPI.md)              | Module to access CamOverlay API.                                                                                       |
| [CamScripterAPI](doc/CamScripterAPI.md)            | Module to access CamScripter API.                                                                                      |
| [CamSwitcherAPI](doc/CamSwitcherAPI.md)            | Module to access CamSwitcher API.                                                                                      |
| [PlaneTrackerAPI](doc/PlaneTrackerAPI.md)          | Module to access PlaneTracker API.                                                                                     |
| [CamStreamerEvents](doc/ws/CamStreamerEvents.md)   | Module which allows receiving events from CamStreamer ACAP application.                                                |
| [OverlayEvents](doc/ws/OverlayEvents.md)           | Module which allows receiving events from Overlay ACAP application.                                                    |
| [CamSwitcherEvents](doc/ws/CamSwitcherEvents.md)   | Module which allows receiving events from CamSwitcher ACAP application.                                                |
| [PlaneTrackerEvents](doc/ws/PlaneTrackerEvents.md) | Module which allows receiving events from PlaneTracker ACAP application.                                               |

## Documentation for Node.js modules

| Module                                                                            | Description                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HttpServer](doc/HttpServer.md)                                                   | Module for processing HTTP requests in your scripts. It also automatically serves up the content from html directory or you can register paths which you can process by your own (e.g. `http://$CAMERA_IP/local/camscripter/proxy/$MY_PACKAGE_NAME/control.cgi`). |
| [VapixEvents](doc/ws/VapixEvents.md)                                              | Module which allows receiving camera events from the VAPIX API.                                                                                                                                                                                                   |
| [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md)                               | Module for easy control of CamOverlay drawing API. For more details on supported video overlay drawing functions see https://camstreamer.com/camoverlay-api1                                                                                                      |
| [CamOverlayPainter](doc/CamOverlayPainter.md)                                     | Contains three modules which makes easier to use CamOverlayDrawingAPI.                                                                                                                                                                                            |
| [CamScripterAPICameraEventsGenerator](doc/CamScripterAPICameraEventsGenerator.md) | Module which allows generating events on an Axis camera. These events can be used for triggers in the Axis camera rule engine (events/actions). It is also an easy way how to integrate events and metadata in VMS systems which support Axis camera events.      |
| [GenetecAgent](doc/GenetecAgent.md)                                               | Module which allows receiving and sending data to Genetec VMS.                                                                                                                                                                                                    |

</br>

# Breaking Changes

<details open>

<summary>from version 3.\*.\* to 4.\*.\* (latest)</summary>

### Breaking changes when moving from version 3.\*.\* to 4.\*.\* (latest)

<hr/>

### ACAP API Class Constructors Updated

All ACAP API classes now **require a client instance to be passed into their constructors** instead of options object.

-   This change improves flexibility by allowing you to use either the Node or Web client, depending on your environment.

Example (before → now):

```typescript
// Before
const coApi = new CamOverlayAPI({
    ip?: string;
    port?: number;
    user?: string;
    pass?: string;
    tls?: boolean;
    tlsInsecure?: boolean;
    keepAlive?: boolean
});

// Now
import { DefaultClient } from 'camstreamerlib/web';
import { CamOverlayAPI } from 'camstreamerlib';

const coApi = new CamOverlayAPI(
    new DefaultClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    })
);
```

### Imports Simplified

Importing from the camstreamerlib is now much easier -> all exports are now re-exported from the root index.js.
You no longer need to import from subpaths.

Example:

```typescript
// Before
import { CamScripterAPI } from 'camstreamerlib/CamScripterAPI';
import { Painter } from 'camstreamerlib/CamOverlayPainter/Painter';
import { DefaultAgent } from 'camstreamerlib/DefaultAgent';

// Now
import { CamScripterAPI } from 'camstreamerlib';
import { Painter } from 'camstreamerlib/node';
import { DefaultClient } from 'camstreamerlib/web';
```

> Note: To ensure compatibility, set the module resolution in your projects tsconfig.json to `"moduleResolution": "bundler"`.

### Class and Method Refactored

-   **CameraVapix API** has been renamed to [**VapixAPI**](doc/VapixAPI.md).
-   **DefaultAgent** has been refactored into two separate classes - one for node, one for web as [**DefaultClient**](doc/Client.md)
-   Several method names and parameter names across the library have been updated for consistency and clarity.

> Please refer to [the documentation](#documentation-for-acap-and-camera-api).

-   New API modules and endpoints have been introduced, providing extended functionality and better coverage of the underlying service.

<hr/>
</details>

<details>

<summary>from version 2.\*.\* to 3.\*.\*</summary>

### Breaking changes when moving from version 2.\*.\* to 3.\*.\*

-   CamStreamerlib requiers Node.js version 18 or higher.
-   CamOverlayDrawingAPI tries to reconnect when the websocket is closed. You don't have to do it manually.

    > However, events `open` and `close` are still emitted in case you need to react to them.

-   Files `common.ts`, `Digest.ts`, `HttpRequest.ts` and `WsClient.ts` moved to a folder internal.
-   Removed function `httpRequest()`. Use `sendRequest()` instead. It uses the same interface except for the "noWaitForData" parameter.

> It returns (Response object)[https://developer.mozilla.org/en-US/docs/Web/API/Response] which doesn't contain data by default.
> If you need to wait for data, you can call for example the function `await res.text()`.
> This change affects the function `vapixGet` from (CameraVapix)[doc/CameraVapix.md] too.

<hr/>
</details>

<details>

<summary>from version 1.\*.\* to 2.\*.\**</summary>

### Breaking changes when moving from version 1.\*.\* to 2.\*.\*

-   Renamed file HTTPRequest.ts to HttpRequest.ts
-   Removed deprecated protocol attribute from all options objects (use tls instead).
-   Removed RTSP

    > Previously CameraVapix.ts supported both WebSocket and RTSP.
    > Starting with version 2.0.0, it supports WebSocket only.

-   ServiceID shouldn't be passed to CamOverlayAPI by the options object. Pass it as a parameter.
-   Renamed CamOverlayDrawingAPI event msg to message.
-   Drawing services extracted from CamOverlayAPI.ts to a separate file.

> Please read [CamOverlayAPI](doc/CamOverlayAPI.md) and [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md) for more information.

</details>
</br>

# For Developers

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
    "create-package": "node node_modules/camstreamerlib/bin/CreatePackage.js"
  }
```

By default, the zipped package does not contain node_modules directory. If you want to include it (required when uploading to CamScripter App on Axis camera), add `-includeNodeModules` or `-i` parameter.

If you need to exclude a file or directory add `-exlude=` or `-e=` parameter with comma separated list.

The zip package is created in the current directory. You can choose different location with the `-where=` or `-w=` option.

```json
"scripts": {
    "create-package": "node node_modules/camstreamerlib/bin/CreatePackage.js -i -e=react"
}
```
