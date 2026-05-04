# VapixAPI

Access the Axis camera VAPIX interface.

> [!TIP]
> For more details, see the documentation for the [Axis camera VAPIX library](https://www.axis.com/vapix-library/).

## Overview

-   [Constructor](#constructor)
-   [Common types](#common-types)
-   [Methods](#common-methods)
    -   [Common](#common-methods)
    -   [SD Card Management](#sd-card-management-methods): Manage SD card mounting etc.
    -   [Camera Parameters](#camera-parameters-methods): Manage camera parameters.
    -   [Guard Tour Management](#guard-tour-management-methods): Manage guard tours on camera.
    -   [PTZ Management](#camera-ptz-management-methods): Manage camera PTZ positions.
    -   [Port Management](#camera-port-management-methods): Manage camera ports.
    -   [Users/Account Management](#camera-users-management-methods): Manage camera users/accounts.
    -   [Recording Rules Management](#camera-recording-rules-management-methods): Manage camera recording rules.
    -   [Application Management](#application-api): Manage starting/stopping/restarting camera applications.

<br/>

## Constructor

-   **new VapixAPI(client, CustomFormData)**
-   Look at the [Client](./Client.md) docs.
-   `CustomFormData` is an optional parameter which defaults to type of `FormData`

The `options` parameter contains access to the camera and specifies which protocol should be used.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { VapixAPI } from 'camstreamerlib';

const vapix = new VapixAPI(new DefaultClient());
```

<br/>

## Common types

```typescript
type TResponse = {
    json: () => Promise<any>;
    text: () => Promise<string>;
    blob: () => Promise<unknown>;
    status: number;
    ok: boolean;
};

type TParameters = {
    [key: string]: string | number | boolean | null | undefined;
};
```

> [!TIP]
> The majority of VapixAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

```typescript
type THttpRequestOptions = {
    timeout?: number;
    proxyParams?: {
        path: string;
        target: {
            ip: string;
            mdnsName: string;
            port: number;
            user: string;
            pass: string;
        };
    };
};
```

<br/>

## Common Methods

### getClient(proxyParams?)

Returns VAPIX API client - can be used in custom VAPIX API calls.

-   **Parameters:**

    -   `proxyParams` (`TProxyParams`, optional)

    ```typescript
    type TProxyParams =
        | {
              path: string;
              target: {
                  ip: string;
                  mdnsName: string;
                  port: number;
                  user: string;
                  pass: string;
              };
          }
        | undefined;
    ```

-   **Returns:** `Client | ProxyClient<Client>`

```javascript
const client = vapix.getClient();
```

### postUrlEncoded(path, parameters?, headers?, options?)

-   **Parameters:**
    -   `path` (`string`): Target path.
    -   `parameters` ([`TParameters`](#common-types), optional)
    -   `headers` (`Record<string, string>`, optional)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TResponse>`](#common-types)

Universal method for HTTP URL encoded POST requests to the camera VAPIX API.

```javascript
await vapix.postUrlEncoded('/axis-cgi/param.cgi', 'action=update&camscripter.enabled=1');
```

### postJson(path, jsonData, headers?, options?)

Universal method for HTTP POST requests to the camera VAPIX API.

-   **Parameters:**
    -   `path` (string): Target path
    -   `jsonData` (`Record<string, any>`)
    -   `headers` (`Record<string, string>`, optional)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TResponse>`](#common-types)

```javascript
await vapix.postJson();
```

### getCameraImage(parameters, options?)

Get an image of the camera using the specified compression and resolution.

-   **Parameters:**

    -   `parameters` (`TCameraImageConfig`)
    -   `options` (`THttpRequestOptions`, optional)

    ```typescript
    type TCameraImageConfig = {
        camera?: string; //selected view area
        resolution?: string; //img resolution
        compression?: number;
        overlays?: string;
        [key: string]: string | number | undefined; // other custom params
    };
    ```

-   **Returns:** `ReturnType<Client['get']>`

```javascript
await vapix.getCameraImage({});
```

### getEventDeclarations(options?)

Get all the available camera events.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await vapix.getEventDeclarations();
```

### getSupportedAudioSampleRate(options?)

Return all supported audio sample rates.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TAudioSampleRates>`

    ```typescript
    type TAudioSampleRates = {
        sampleRate: number;
        bitRates: number[];
    };
    ```

```javascript
await vapix.getSupportedAudioSampleRate();
```

### performAutofocus(options?)

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.performAutofocus();
```

### downloadCameraReport(options?)

Generate and return a server report including product information, parameter settings, and system logs.

> [!TIP] > [Server report - Axis docummentation](https://developer.axis.com/vapix/network-video/system-settings/#server-report)

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await vapix.downloadCameraReport();
```

### getSystemLog(options?)

Generate and return a system log information.

> [!TIP] > [System log - Axis docummentation](https://developer.axis.com/vapix/network-video/system-settings/#http-api-logs)

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await vapix.getSystemLog();
```

### getMaxFps(channel, options?)

Return the maximum supported FPS on the given channel.

-   **Parameters:**
    -   `channel` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
await vapix.getMaxFps(10);
```

### getTimezone(options?)

Return the timezone of the camera.

> [!NOTE]
> There are two enpoints for getting camera timezone - one is depracated - the method tries calling the new one, if it fails it tries the depracated one

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const timezone = await vapix.getTimezone();
```

### getDateTimeInfo(options?)

Return the current date/time information from the camera.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:**

    ```typescript
    Promise<{
        data: {
            dateTime: string;
            dstEnabled: boolean;
            localDateTime: string;
            posixTimeZone: string;
            timeZone?: string | undefined;
        };
    }>;
    ```

```javascript
const timeInfo = await vapix.getDateTimeInfo();
```

### getDevicesSettings(options?)

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TAudioDevice[]>`:

    ```typescript
    type TAudioDevice = {
        name: string;
        id: string;
        inputs: {
            name: string;
            id: string;
            enabled: boolean;
            connectionTypes: {
                id: string;
                signalingTypeSelected: string;
                signalingTypes: {
                    id: string;
                    channels: {
                        id: string;
                        gain: number;
                        mute: boolean;
                    }[];
                    powerType?: string | undefined;
                }[];
            }[];
            connectionTypeSelected: string;
        }[];
        outputs: {
            name: string;
            id: string;
            enabled: boolean;
            connectionTypes: {
                id: string;
                signalingTypeSelected: string;
                signalingTypes: {
                    id: string;
                    channels: {
                        id: string;
                        gain: number;
                        mute: boolean;
                    }[];
                    powerType?: string | undefined;
                }[];
            }[];
            connectionTypeSelected: string;
        }[];
    };
    ```

```javascript
const settings = await vapix.getDevicesSettings();
```

### fetchRemoteDeviceInfo(payload, options?)

-   **Parameters:**
    -   `payload` (`T extends Record<string, any>`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<any>`

```javascript
await vapix.fetchRemoteDeviceInfo(payload);
```

### getHeaders(options?)

Read all custom HTTP headers from the camera.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Record<string, string>>`

```javascript
const headers = await vapix.getHeaders();
```

### setHeaders(headers, options?)

Add custom HTTP headers to the camera.

-   **Parameters:**
    -   `headers` (`Record<string, string>`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.setHeaders(headers);
```

<br/>

## SD Card Management Methods

### checkSDCard(options?)

Return info about the camera's SD card.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TSDCardInfo>`

    ```typescript
    type TSDCardInfo = {
        status: 'OK' | 'connected' | 'disconnected';
        totalSize: number;
        freeSize: number;
    };
    ```

```javascript
await vapix.checkSDCard();
```

### mountSDCard(options?) / unmountSDCard(options?)

Mount/unmount SD Card.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
await vapix.mountSDCard();
await vapix.unmountSDCard();
```

### fetchSDCardJobProgress(jobId, options?)

Returns SD Card progress number.

-   **Parameters:**
    -   `jobId` (number): Id of the job progress.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
await vapix.fetchSDCardJobProgress(1);
```

<br/>

## Camera Parameters Methods

> [!TIP] > [Param API - Axis docummentation](https://developer.axis.com/vapix/device-configuration/param-api/)

### getParameter(paramNames, options?)

Get parameters from the camera.

-   **Parameters:**
    -   `paramNames` (`string` | `string[]`): Searched param name or list of param names.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Record<string, string>>`

```javascript
const params = await vapix.getParameter(['camscripter', 'camoverlay']);
```

### setParameter(params, options?)

Set parameters to the camera.

-   **Parameters:**
    -   `params` (`Record<string, string | number | boolean>`): Record of param name and its value.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
const params = await vapix.setParameter({ 'root.camscripter.Enabled': '1' });
```

<br/>

## Guard Tour Management Methods

### getGuardTourList(options?)

Get the list of guard tours.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TGuardTour[]>`:

    ```typescript
    type TGuardTour = {
        name: string;
        id: string;
        running: string;
        tour: {
            moveSpeed?: unknown;
            position?: unknown;
            presetNbr?: unknown;
            waitTime?: unknown;
            waitTimeViewType?: unknown;
        }[];
        camNbr: unknown;
        randomEnabled: unknown;
        timeBetweenSequences: unknown;
    };
    ```

```javascript
const guardList = await vapix.getGuardTourList();
```

### setGuardTourEnabled(guardTourId, enable, options?)

Enable or disable the guard tour.

-   **Parameters:**
    -   `guardTourId` (`string`): Id of the guard tour.
    -   `enable` (`boolean`): Turn the guard tour on or off.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.setGuardTourEnabled('root.GuardTour.G0', true);
```

<br/>

## Camera PTZ Management Methods

> [!TIP] > [PTZ API - Axis docummentation](https://developer.axis.com/vapix/network-video/pantiltzoom-api/)

### getPTZPresetList(channel, options?)

Get a list of PTZ presets for the specified channel. Channels are numbered from 1.

-   **Parameters:**
    -   `channel` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string[]>`

```javascript
const presets = await vapix.getPTZPresetList(1);
```

### listPTZ(camera, options?)

-   **Parameters:**
    -   `camera` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TCameraPTZItem[]>`:

    ```typescript
    type TCameraPTZItem = {
        data: {
            pan?: number | undefined;
            tilt?: number | undefined;
            zoom?: number | undefined;
        };
        id: number;
        name: string;
    };
    ```

```javascript
const list = await vapix.listPTZ(2);
```

### listPtzVideoSourceOverview(options?)

Return current preset positions for all video channels.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TPtzOverview>`:

    ```typescript
    type TPtzOverview = {
        [x: number]: {
            id: number;
            name: string;
        }[];
    };
    ```

```javascript
const overview = await vapix.listPtzVideoSourceOverview();
```

### goToPreset(channel, presetName, options?)

Move the camera channel to the PTZ preset.

-   **Parameters:**
    -   `channel` (`number`)
    -   `presetName` (`string`): Name of the target preset.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.goToPreset(1, 'home');
```

### goToPreset(camera, options?)

Return values of pan, tilt, and zoom for the current position.

-   **Parameters:**
    -   `camera` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TCameraPTZItemData>`

    ```typescript
    type TCameraPTZItemData = {
        pan: number | undefined;
        tilt: number | undefined;
        zoom: number | undefined;
    };
    ```

```javascript
await vapix.goToPreset(2);
```

<br/>

## Camera Port Management Methods

> [!TIP] > [Input and outpus - Axis docummentation](https://developer.axis.com/vapix/network-video/input-and-outputs/)

### getPorts(options?)

Get the list of ports and their configurations.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:**

    ```typescript
    Promise<
        {
            name: string;
            port: string;
            state: 'open' | 'closed';
            configurable: boolean;
            usage: string;
            direction: 'input' | 'output';
            normalState: 'open' | 'closed';
            readonly?: boolean | undefined;
        }[]
    >;
    ```

```javascript
const ports = await vapix.getPorts();
```

### setPorts(ports, options?)

Set the configuration for multiple ports.

-   **Parameters:**
    -   `ports` (`TPortSetSchema[]`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

    ```typescript
    type TPortSetSchema = {
        port: string;
        state: 'open' | 'closed';
        name: string | undefined;
        usage: string | undefined;
        direction: 'input' | 'output' | undefined;
        normalState: 'open' | 'closed' | undefined;
    };
    ```

```javascript
await vapix.setPorts([
    { port: '1', state: 'closed' },
    { port: '2', state: 'open' },
]);
```

### setPortStateSequence(port, sequence, options?)

Set a sequence of states for a specific port.

-   **Parameters:**
    -   `port` (`number`): Port number.
    -   `sequence` (`TPortSequenceStateSchema[]`): List of port configuration sequence - state, duration of that state.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

    ```typescript
    type TPortSequenceStateSchema = {
        state: 'open' | 'closed';
        time: number;
    };
    ```

```javascript
await vapix.setPortStateSequence(1, [
    { state: 'open', duration: 1000 },
    { state: 'closed', duration: 2000 },
]);
```

<br/>

## Camera Users Management Methods

### getCameraUsers(options?)

Get list of accounts/users on camera as string.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const users = await vapix.getCameraUsers('CamStreamer');
```

### addCameraUser(username, pass, sgrp, comment?, options?)

Add new camera account/user.

-   **Parameters:**
    -   `username` (`string`): User name.
    -   `pass` (`string`): User password.
    -   `sgrp` (`string`): User group (e.g. 'viewer', 'operator', 'administator' ).
    -   `comment` (`string`, optional): Optional comment added to the user.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await vapix.addCameraUser('user1', '1234', 'viewer', 'important user');
```

### editCameraUser(username, pass, options?)

Edit existing camera account/user password.

-   **Parameters:**
    -   `username` (`string`): User name.
    -   `pass` (`string`): User password.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await vapix.editCameraUser('user1', '4568');
```

<br/>

## Camera Recording Rules Management Methods

> [!TIP] > [Edge storage API - Axis docummentation](https://developer.axis.com/vapix/network-video/edge-storage-api/)

### getRecordingRuleList(options?)

Get all existing recording rules on camera.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Element | undefined>`: Returns parsed xml response from camera.

```javascript
const rules = await vapix.getRecordingRuleList();
```

### addRecordingRule(params, options?)

Add new recording rule to camera.

-   **Parameters:**
    -   `params` (`Record<string, string>`): Query string specifying when the rule should be active.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Element | undefined>`: Returns parsed xml response from camera.

```javascript
await vapix.addRecordingRule('someparam=1&otherparam=2');
```

### removeRecordingRule(profileId, options?)

Remove recording rule which matches specified `profileId`.

-   **Parameters:**
    -   `profileId` (`string`): Id of the rule.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Element | undefined>`: Returns parsed xml response from camera.

```javascript
await vapix.removeRecordingRule('1');
```

### getDiskInfo(diskId?, options?)

Get status information about camera disks.

-   **Parameters:**
    -   `diskId` (`string`, optional, default = `'all'`): Specify disk type (e.g. 'SD_DISK', 'NetworkShare')
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Element | undefined>`: Returns parsed xml response from camera.

```javascript
const info = await vapix.getDiskInfo();
```

<br/>

## Application API

### getApplicationList(options?)

Get the list of installed Acap applications.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TApplicationList>`

    ```typescript
    type TApplicationList = {
        Name: string;
        NiceName: string;
        Vendor: string;
        Version: string;
        License: string;
        Status: string;
        appId:
            | 'CamStreamer'
            | 'CamSwitcher'
            | 'CamOverlay'
            | 'CamScripter'
            | 'PlaneTracker'
            | 'Ndihxplugin'
            | 'SportTracker'
            | null;
        ApplicationID: string | undefined;
        ConfigurationPage: string | undefined;
        VendorHomePage: string | undefined;
        LicenseName: string | undefined;
    }[];
    ```

```javascript
const appList = await vapix.getApplicationList();
```

### startApplication(applicationId, options?)

Start the application whose name is given by the parameter `applicationId`.

-   **Parameters:**
    -   `applicationId` (`string`): Id of the ACAP application.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.startApplication('CamStreamer');
```

### restartApplication(applicationId, options?)

Restart the application whose name is given by the parameter `applicationId`.

-   **Parameters:**
    -   `applicationId` (`string`): Id of the ACAP application.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.restartApplication('CamStreamer');
```

### stopApplication(applicationId, options?)

Stop the application whose name is given by the parameter `applicationId`.

-   **Parameters:**
    -   `applicationId` (`string`): Id of the ACAP application.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.stopApplication('CamStreamer');
```

### installApplication(data, fileName, options?)

Install ACAP application.

-   **Parameters:**
    -   `data` (`Parameters<typeof FormData.prototype.append>[1]`): ACAP application data.
    -   `fileName` (`string`): Name of the installation file.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await vapix.installApplication(blob, 'CamStreamer.eap');
```
