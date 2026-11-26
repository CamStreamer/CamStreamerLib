---
name: camscripter-packages
description: >
  Build, debug and package CamScripter microapps (also called CamScripter apps, scripts or
  packages): Node.js code that runs inside an Axis camera, or on CamScripter RPi, and is uploaded
  to CamScripter App as a .zip. Use whenever the user wants to create or fix a CamScripter package,
  write a script or app that runs on an Axis camera, show data from an external device or API
  (scores, sensors, weather stations, REST, MQTT, serial) in the camera image, update CamOverlay
  graphics, start or stop CamStreamer streams, switch CamSwitcher playlists, react to Axis (VAPIX)
  events, generate custom camera events, use camstreamerlib (CamStreamerLib), or reach a camera
  through CamStreamer Cloud. Use it even when the user does not say "CamScripter" but asks for code
  that runs on an Axis camera or controls CamStreamer apps.
---

# CamScripter Skill

Written against **camstreamerlib 5.0.x** (Node.js 18+, TypeScript 5.9+ with `strict: true`) and
checked against the published **AXIS OS 13** breaking changes (see "AXIS OS 13 readiness").
The library changed a lot between v3, v4 and v5. If a project pins an older version, read the
"Breaking Changes" section of the library README before reusing any snippet from this file.

Sources of truth, in this order:

- Library and per-module docs: https://github.com/CamStreamer/CamStreamerLib
- Working example packages: https://github.com/CamStreamer/CamScripterApp_examples
  (for the settings UI, the `videoCheckpoint` example has the latest UI components)
- HTTP API reference: https://camstreamer.com/api
- CamStreamer Cloud API reference: https://camstreamer.survilla.support/api-management/

## What CamScripter is

CamScripter App is an ACAP application running inside an Axis camera. It hosts **microapps**:
Node.js packages uploaded as `.zip` files that run as persistent services in the camera. A microapp
typically reads data from somewhere (REST, MQTT, serial, camera events) and acts on other
CamStreamer apps: CamOverlay (graphics in video), CamStreamer (live streams), CamSwitcher
(playlists and views). CamScripter RPi runs the same packages on a Raspberry Pi.

## Package layout

```
mypackage/
├── html/              # optional settings UI, served by HttpServer
│   ├── index.html
│   └── index.js
├── localdata/
│   └── settings.json  # default settings
├── src/main.ts        # TypeScript source, compiled to dist/main.js
├── manifest.json      # required
├── package.json
└── package-lock.json  # required by the packaging script
```

Plain JavaScript packages put `main.js` in the package root instead of `src/` + `dist/`.

For the settings UI in `html/`, follow the videoCheckpoint example, which uses the latest UI
components: https://github.com/CamStreamer/CamScripterApp_examples/tree/master/videoCheckpoint.
Copy its UI structure instead of writing the settings page from scratch.

### manifest.json

```json
{
  "package_name": "mypackage",
  "package_menu_name": "My Package",
  "package_version": "1.0.0",
  "vendor": "Your Name",
  "required_camscripter_version": "1.5.3",
  "required_camscripter_rbi_version": "1.4.0",
  "ui_link": "/local/camscripter/package/mypackage/index.html"
}
```

- `package_name` is the identifier: it must match the name used in `ui_link` and in the proxy URLs.
- `package_version` uses `x.y.z` and should match `version` in `package.json`.
- `required_camscripter_version` is the minimum CamScripter App version on an Axis camera;
  `required_camscripter_rbi_version` is the minimum CamScripter RPi version. Set the one(s) for
  the platforms the package supports.
- `vendor` is free text shown in the UI.
- Omit `ui_link` when the package has no settings UI.

### This is not an Axis ACAP manifest

Two different files are both called `manifest.json`. Do not mix their fields.

| | CamScripter package | Axis ACAP application |
|---|---|---|
| Delivered as | `.zip` uploaded into CamScripter App | `.eap` installed on the camera |
| Built with | `CreatePackage.js` | `acap-build` (ACAP Native SDK) |
| Manifest shape | flat, `package_*` keys | `schemaVersion` + `acapPackageConf.setup` |
| Signed by Axis | No. Nothing to sign; it runs inside CamScripter App, which is itself a signed ACAP | Yes, the `.eap` is uploaded to the Axis ACAP signing service |

A CamScripter package never needs Axis signing, and the signing service accepts only `.eap`
files. If the same project is also shipped as a standalone ACAP, that build has its own manifest:

```json
{
  "schemaVersion": "2.x.x",
  "acapPackageConf": {
    "setup": {
      "appName": "mypackage",
      "vendor": "VENDOR_FROM_AXIS_PORTAL",
      "vendorId": "VENDOR_ID_FROM_AXIS_PORTAL",
      "version": "1.0.0",
      "architecture": "aarch64",
      "compatibleOsVersions": [{ "min": "12.0", "max": "13" }],
      "runMode": "once"
    }
  }
}
```

For signing, `vendor` and `vendorId` must match the values shown in the Axis ACAP Service Portal
exactly (case-sensitive), the manifest must use schema v2.x, and any manifest change requires a
rebuild before re-uploading. `compatibleOsVersions` is required from AXIS OS 13 and `max` must
always be set; list only the AXIS OS versions the build was actually tested on. `architecture` is `aarch64` for ARTPEC-8/9 and `armv7hf` for ARTPEC-7.
Details: https://developer.axis.com/acap/how-to-guides/service-portal/acap-application-signing/

## Runtime environment

| Variable | Meaning |
|---|---|
| `HTTP_PORT` | Port your HttpServer listens on; reached through the authenticated proxy |
| `HTTP_PORT_PUBLIC` | Port reached through the public (no auth) proxy |
| `INSTALL_PATH` | Where the package files are installed |
| `PERSISTENT_DATA_PATH` | Survives restarts and upgrades; `settings.json` lives here |
| `PACKAGE_NAME` | `package_name` from the manifest |

Lifecycle rule: when the user saves settings in the UI, CamScripter sends **SIGINT** and restarts
the process. Read settings once at startup and exit cleanly on SIGINT.

Proxy URLs:

```
https://CAMERA_ADDRESS/local/camscripter/proxy/PACKAGE_NAME/*         → localhost:HTTP_PORT        (camera auth)
https://CAMERA_ADDRESS/local/camscripter/proxy_public/PACKAGE_NAME/*  → localhost:HTTP_PORT_PUBLIC (no auth)
```

Anything stdout/stderr prints appears in the CamScripter system log.

## camstreamerlib v5 in three rules

1. **Two import paths.** App API classes come from `camstreamerlib`; Node-only helpers come from
   `camstreamerlib/node`. The old per-file subpaths (`camstreamerlib/CamOverlayAPI`) are gone.
2. **API classes take a client, not options.** Build a `DefaultClient` (local) or a
   `DeviceConnectClient` (CamStreamer Cloud) and pass it in.
3. **Websocket helpers need `connect()`.** `VapixEvents`, `CamOverlayDrawingAPI`, `Painter` and
   `CamScripterAPICameraEventsGenerator` take an options object and do nothing until connected.

| Import from `camstreamerlib` | Purpose |
|---|---|
| `CamOverlayAPI` | Custom Graphics text/images, infoticker, enable/disable services |
| `CamStreamerAPI` | Stream list, enable/disable streams |
| `CamSwitcherAPI` | Playlists, switching, queue, clips |
| `CamScripterAPI` | CamScripter package management |
| `VapixAPI` | Axis VAPIX (parameters, PTZ, ports, images). Replaces `CameraVapix` |

| Import from `camstreamerlib/node` | Purpose |
|---|---|
| `DefaultClient`, `DeviceConnectClient` | HTTP clients for local and cloud access |
| `HttpServer` | HTTP endpoints plus static files from `html/` |
| `VapixEvents` | Subscribe to Axis camera events |
| `CamScripterAPICameraEventsGenerator` | Declare and send custom Axis events |
| `CamOverlayDrawingAPI`, `Painter`, `Frame` | Draw overlays with Cairo commands |
| `GenetecAgent`, `MilestoneAgent` | VMS integrations |

## Microapp skeleton

Start every microapp from this and delete what you do not need.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { CamOverlayAPI } from 'camstreamerlib';
import { DefaultClient, HttpServer, VapixEvents } from 'camstreamerlib/node';

type Settings = {
    camera_ip: string;
    camera_port: number; // 443 with TLS, 80 without
    camera_tls: boolean; // AXIS OS 13 allows only HTTPS after a factory default
    camera_user: string;
    camera_pass: string;
    service_id: number;
};

// 1. Settings: read once, fail loudly
const settingsPath = path.join(process.env.PERSISTENT_DATA_PATH ?? './localdata', 'settings.json');
let settings: Settings;
try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as Settings;
} catch (err) {
    console.error('Cannot read settings:', err);
    process.exit(1);
}

const connection = {
    ip: settings.camera_ip, // use localhost when targeting the camera the microapp runs on
    port: settings.camera_port,
    user: settings.camera_user,
    pass: settings.camera_pass,
    tls: settings.camera_tls,
    tlsInsecure: settings.camera_tls, // accept the camera's self-signed default certificate
};

// 2. HTTP server: reads HTTP_PORT itself and listens immediately. There is no listen(),
//    get() or post(); onRequest() receives every method for the path.
const httpServer = new HttpServer();
httpServer.onRequest('/status.cgi', (req, res) => {
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
});

// 3. CamOverlay: API classes take a client
const camOverlay = new CamOverlayAPI(new DefaultClient(connection));

// 4. Axis events: the event name is the topic filter. Register listeners before connect().
const vapixEvents = new VapixEvents(connection);
vapixEvents.on('tns1:Device/tnsaxis:IO/VirtualInput', async (event) => {
    try {
        console.log('Event:', JSON.stringify(event));
        await camOverlay.updateCGText(settings.service_id, [
            { field_name: 'status', text: 'Triggered ' + new Date().toLocaleTimeString() },
        ]);
    } catch (err) {
        console.error('Overlay update failed:', err);
    }
});
vapixEvents.on('error', (err) => console.error('VapixEvents error:', err));
vapixEvents.connect();

// 5. Settings changed: CamScripter sends SIGINT and restarts us
process.on('SIGINT', () => {
    vapixEvents.disconnect();
    httpServer.close();
    process.exit(0);
});
```

## Recipes

### Update CamOverlay Custom Graphics text

The graphic is designed in the CamOverlay UI; the microapp only pushes field values. Choose this
whenever a designed graphic is enough.

```typescript
import { CamOverlayAPI } from 'camstreamerlib';
import { DefaultClient } from 'camstreamerlib/node';

const camOverlay = new CamOverlayAPI(new DefaultClient({ ip: 'CAMERA_ADDRESS', user: 'USER', pass: 'PASSWORD' }));
await camOverlay.updateCGText(2, [
    { field_name: 'temperature', text: '23.5 °C' },
    { field_name: 'status', text: 'OK' },
]);
await camOverlay.setEnabled(2, true); // show or hide the service
```

### Draw an overlay programmatically

Use `CamOverlayDrawingAPI` (raw Cairo commands) or `Painter`/`Frame` (layout helper on top of it)
only when shapes, colours or layout must be computed in code. The library reconnects on its own;
recreate fonts and images in the `open` handler because handles are lost on reconnect.

```typescript
import { CamOverlayDrawingAPI } from 'camstreamerlib/node';

const cod = new CamOverlayDrawingAPI({ ip: 'CAMERA_ADDRESS', user: 'USER', pass: 'PASSWORD', camera: [0] });
cod.on('open', () => console.log('CamOverlay drawing connected'));
cod.on('error', (err) => console.error(err));
cod.connect();
```

The Cairo command set is documented at https://camstreamer.com/camoverlay-api1. For a complete
drawing example, copy from the CamScripterApp_examples repository instead of writing from memory.

### Start or stop a CamStreamer stream

```typescript
import { CamStreamerAPI } from 'camstreamerlib';
import { DefaultClient } from 'camstreamerlib/node';

const camStreamer = new CamStreamerAPI(new DefaultClient({ ip: 'CAMERA_ADDRESS', user: 'USER', pass: 'PASSWORD' }));
await camStreamer.setStreamEnabled('1234', true); // stream IDs are strings
await camStreamer.setStreamEnabled('1234', false);
```

`getStreamList()` throws `MigrationError` when the camera still holds streams saved in the old
format; catch it and read `.valid` / `.old`.

### Switch a CamSwitcher playlist

```typescript
import { CamSwitcherAPI } from 'camstreamerlib';
import { DefaultClient } from 'camstreamerlib/node';

const camSwitcher = new CamSwitcherAPI(new DefaultClient({ ip: 'CAMERA_ADDRESS', user: 'USER', pass: 'PASSWORD' }));
const playlists = await camSwitcher.getPlaylistSaveList(); // record keyed by playlist name
console.log(Object.keys(playlists));
await camSwitcher.playlistSwitch('MainView'); // switch now
await camSwitcher.playlistQueuePush('GateView'); // play after the current one
```

### Generate a custom Axis event

Custom events show up in the camera's rule engine and in VMS systems that read Axis events.

```typescript
import { CamScripterAPICameraEventsGenerator } from 'camstreamerlib/node';

const generator = new CamScripterAPICameraEventsGenerator({ ip: 'CAMERA_ADDRESS', user: 'USER', pass: 'PASSWORD' });
generator.on('error', (err) => console.error(err));
generator.connect();

await generator.declareEvent({
    declaration_id: 'mypackage_count',
    stateless: true,
    declaration: [
        { namespace: 'tnsaxis', key: 'topic0', value: 'CameraApplicationPlatform', value_type: 'STRING' },
        { namespace: 'tnsaxis', key: 'topic1', value: 'CamScripter', value_type: 'STRING' },
        { namespace: 'tnsaxis', key: 'topic2', value: 'MyPackageCount', value_type: 'STRING' },
        { type: 'DATA', namespace: '', key: 'count', value: 0, value_type: 'INT' },
    ],
});

await generator.sendEvent({
    declaration_id: 'mypackage_count',
    event_data: [{ namespace: '', key: 'count', value: 42, value_type: 'INT' }],
});
```

### Reach a camera through CamStreamer Cloud

For a camera reached through CamStreamer Cloud, swap the client and keep everything else the same. The
device access token replaces user name and password.

```typescript
import { CamOverlayAPI } from 'camstreamerlib';
import { DeviceConnectClient } from 'camstreamerlib/node';

const client = new DeviceConnectClient('YOUR_DEVICE_ACCESS_TOKEN', 'YOUR_CLOUD_DEVICE_ADDRESS');
const camOverlay = new CamOverlayAPI(client);
await camOverlay.updateCGText(2, [{ field_name: 'status', text: 'Hello from the cloud' }]);
```

For device access tokens, cloud device addresses and other CamStreamer Cloud endpoints, see the
CamStreamer Cloud API reference: https://camstreamer.survilla.support/api-management/

### Without the library (curl, external systems)

Every app also exposes plain HTTP endpoints, useful for one-off triggers from other systems:

```bash
# CamOverlay Custom Graphics: set text fields of service 2
curl -k --anyauth -u USER:PASSWORD "https://CAMERA_ADDRESS/local/camoverlay/api/customGraphics.cgi?action=update_text&service_id=2&field1=Hello"

# Same call through CamStreamer Cloud
curl "https://YOUR_CLOUD_DEVICE_ADDRESS/local/camoverlay/api/customGraphics.cgi?action=update_text&service_id=2&field1=Hello&DEVICE_ACCESS_TOKEN=YOUR_DEVICE_ACCESS_TOKEN"
```

`-k` accepts the camera's self-signed default certificate; drop it when the camera has a trusted
certificate. Paths and parameters differ between app versions. Look the endpoint up at
https://camstreamer.com/api for the installed version instead of guessing.

## Build and deploy

```json
"scripts": {
    "build": "tsc",
    "create-package": "tsc && node node_modules/camstreamerlib/bin/CreatePackage.js -i"
}
```

- The script zips; it does not compile. It packs `dist/` if present, so always run `tsc` first.
- `-i` bundles production `node_modules` (required on a camera). It runs `npm ci --omit=dev`, so
  `package-lock.json` must exist and runtime packages must be in `dependencies`.
- `-e=dir1,dir2` excludes files or folders; `-w=path` changes the output folder.
- Output is `<package_name>_<version with underscores>.zip`, e.g. `mypackage_1_0_0.zip`.

Upload the zip in the CamScripter UI, or from the command line:

```bash
curl -k --anyauth -u USER:PASSWORD -F file=@mypackage_1_0_0.zip "https://CAMERA_ADDRESS/local/camscripter/package/install.cgi"
```

## AXIS OS 13 readiness

AXIS OS 13 changes what installs and what is reachable by default. Apply these whenever the
target camera runs, or will be upgraded to, AXIS OS 13.

**The microapp package itself**

- A microapp is not an ACAP, so it needs no signing, no `compatibleOsVersions` and no rebuild.
- The host does: CamScripter App and every other CamStreamer app on the camera must be a signed,
  AXIS OS 13 compatible version **before** the upgrade. If any installed ACAP is incompatible,
  the whole upgrade rolls back to AXIS OS 12. Check versions at https://camstreamer.com/download-app.
- Prefer pure JavaScript dependencies. A dependency with a prebuilt native binary (`.node` file)
  must match the camera architecture, and on 32-bit devices (ARTPEC-7) AXIS OS 13 switches to
  64-bit time, which breaks binaries built for older systems.
- AXIS OS 13 does not support ARTPEC-6 devices; they stay on older AXIS OS.

**Connections to the camera**

- After a factory default only HTTPS (port 443) is open; HTTP on port 80 must be enabled
  deliberately. Never hard-code `tls: false` or port 80. Keep `tls` and `port` in settings and
  set `tlsInsecure: true` only for the self-signed default certificate.
- New or edited accounts must meet password complexity rules (15 characters, or 12 with mixed
  character classes). Do not suggest short example passwords, and prefer a dedicated account
  with the lowest role that works instead of the main administrator.
- Whether a microapp can still reach its own camera over plain HTTP on localhost when HTTP is
  disabled is not documented by Axis. Test it on the device; fall back to HTTPS on port 443.

**VAPIX calls from a microapp**

Removed in AXIS OS 13, so do not generate code that uses them:

- Recording start/stop through `record.cgi` and `stop.cgi`.
- Parameters `Time.POSIXTimeZone`, `Time.DST.Enabled`, all `Layout.*`,
  `Image.I#.Appearance.Rotation`, `Image.PrivacyMaskType`, `Network.HTTP.AuthenticationPolicy`,
  `Network.UPnP.Enabled`, and most legacy `Storage.*` parameters.
- UPnP discovery, and the legacy Camera Tampering detector with its events.

Use the camstreamerlib `VapixAPI` methods where one exists (for example `getTimezone()` already
uses the newer time API). The full list is the "Changes in AXIS OS 13" section of
https://help.axis.com/en-us/axis-os; check it before relying on any older VAPIX call.

## Rules for the assistant

- Ask which camstreamerlib version the project uses before editing existing code; do not mix v3
  and v5 patterns in one file.
- Prefer Custom Graphics (`updateCGText`) over Cairo drawing unless the user needs computed graphics.
- Never hard-code credentials or device access tokens in source; read them from settings.
- A device access token in a URL grants access to the camera. Use HTTPS and placeholders in
  anything that will be shared, logged or published.
- Wrap every network call in `try/catch` and log with a package prefix; an unhandled rejection
  restarts the microapp.
- When unsure about a method name or endpoint, check the library's type definitions or the docs
  above. Do not invent methods.
