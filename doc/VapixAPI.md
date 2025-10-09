# VapixAPI

Access the Axis camera VAPIX interface. For more details, see the documentation for the [Axis camera VAPIX library](https://www.axis.com/vapix-library/).

## Constructor

-   **new VapixAPI(client)** - Look at the [Client](./Client.md) docs.

The `options` parameter contains access to the camera and specifies which protocol should be used.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { VapixAPI } from 'camstreamerlib/web';

const vapix = new VapixAPI(
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

> [!NOTE]
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

## Methods - Common

### getClient(proxyParams?)

Returns VAPIX API client - can be used in custom VAPIX API calls.

-   **Parameters:**

    -   `proxyParams`:

    ```typescript
    type TProxyParams =
        | {
              path: string;
              target: TProxyTarget;
          }
        | undefined;
    ```

-   **Returns:** `Client | ProxyClient<Client>`

```javascript
const client = vapix.getClient();
```

### postUrlEncoded(path, parameters?, headers?, options?)

-   **Parameters:**
    -   `path` (string)
    -   `parameters` (`TParameters`)
    -   `headers` (`Record<string, string>`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<>`

Universal method for HTTP URL encoded POST requests to the camera VAPIX API.

```javascript
vapix.postUrlEncoded('/axis-cgi/param.cgi', 'action=update&camscripter.enabled=1');
```

### postJson(path, jsonData, headers?, options?)

Universal method for HTTP POST requests to the camera VAPIX API.

-   **Parameters:**
    -   `path` (string)
    -   `jsonData` (`Record<string, any>`)
    -   `headers` (`Record<string, string>`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<>`

```javascript
vapix.postJson();
```

### getCameraImage(parameters, options?)

Get an image of the camera using the specified compression and resolution.

-   **Parameters:**

    -   `parameters` (`TCameraImageConfig`)
    -   `options` (`THttpRequestOptions` | undefined)

    ```typescript
    type TCameraImageConfig = {
        camera?: string; //selected view area
        resolution?: string; //img resolution
        compression?: number;
        overlays?: string;
        [key: string]: string | number | undefined;
    };
    ```

-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await vapix.getCameraImage({});
```

### getEventDeclarations(options?)

Get all the available camera events.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<string>`

```javascript
await vapix.getEventDeclarations();
```

### getSupportedAudioSampleRate(options?)

Return all supported audio sample rates.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<void>`

```javascript
await vapix.performAutofocus();
```

### checkSdCard(options?)

Return info about the camera's SD card.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TSDCardInfo>`

    ```typescript
    type TSDCardInfo = {
        status: 'OK' | 'connected' | 'disconnected';
        totalSize: number;
        freeSize: number;
    };
    ```

```javascript
await vapix.checkSdCard();
```

### mountSDCard(options?) / unmountSDCard(options?)

Mount/unmount SD Card.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<number>`

```javascript
await vapix.mountSDCard();
await vapix.unmountSDCard();
```

### fetchSDCardJobProgress(jobId, options?)

Returns SD Card progress number.

-   **Parameters:**
    -   `jobId` (number)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<number>`

```javascript
await vapix.fetchSDCardJobProgress(1);
```

### downloadCameraReport(options?)

Generate and return a server report including product information, parameter settings, and system logs.

-   [Server report - Axis docummentation](https://developer.axis.com/vapix/network-video/system-settings/#server-report)

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TResponse | UndiciResponse>`

```javascript
await vapix.downloadCameraReport();
```

### getSystemLog(options?)

Generate and return a system log information.

-   [System log - Axis docummentation](https://developer.axis.com/vapix/network-video/system-settings/#http-api-logs)

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TResponse | UndiciResponse>`

```javascript
await vapix.getSystemLog();
```

### getMaxFps(channel, options?)

Return the maximum supported FPS on the given channel.

-   **Parameters:**
    -   `channel` (number)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<number>`

```javascript
await vapix.getMaxFps(10);
```

### getTimezone(options?)

Return the timezone of the camera.

> [!NOTE]
> There are two enpoints for getting camera timezone - one is depracated - the method tries calling the new one, if it fails it tries the depracated one

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<string>`

```javascript
const timezone = await vapix.getTimezone();
```

### getDateTimeInfo(options?)

Return the maximum supported FPS on the given channel.

-   **Parameters:**
    -   `channel` (number)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<>`

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
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `options` (T extends Record<string, any>)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<any>`

```javascript
await vapix.fetchRemoteDeviceInfo(payload);
```

### getHeaders(options?)

Read all custom HTTP headers from the camera.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Record<string, string>>`

```javascript
const headers = await vapix.getHeaders();
```

### setHeaders(headers, options?)

Add custom HTTP headers to the camera.

-   **Parameters:**
    -   `headers` (Record<string, string>)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TResponse | UndiciResponse>`

```javascript
await vapix.setHeaders(headers);
```

## param.cgi

### getParameter(paramNames, options?)

Get parameters from the camera.

-   **Parameters:**
    -   `paramNames` (string | string[])
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Record<string, string>>`

```javascript
const params = await vapix.getParameter(['camscripter', 'camoverlay']);
```

### setParameter(params, options?)

Set parameters to the camera.

-   **Parameters:**
    -   `params` (Record<string, string | number | boolean>)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<void>`

```javascript
const params = await vapix.setParameter({ 'root.camscripter.Enabled': '1' });
```

### getGuardTourList(options?)

Get the list of guard tours.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `guardTourId` (string)
    -   `enable` (boolean)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<void>`

```javascript
await vapix.setGuardTourEnabled('root.GuardTour.G0', true);
```

## ptz.cgi

### getPTZPresetList(channel, options?)

Get a list of PTZ presets for the specified channel. Channels are numbered from 1.

-   **Parameters:**
    -   `channel` (number)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<string[]>`

```javascript
const presets = await vapix.getPTZPresetList(1);
```

### listPTZ(camera, options?)

-   **Parameters:**
    -   `camera` (number)
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `channel` (number)
    -   `presetName` (string)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TResponse | UndiciResponse>`

```javascript
await vapix.goToPreset(1, 'home');
```

### goToPreset(camera, options?)

Return values of pan, tilt, and zoom for the current position.

-   **Parameters:**
    -   `camera` (number)
    -   `options` (`THttpRequestOptions` | undefined)
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

## portmanagement.cgi

### getPorts(options?)

Get the list of ports and their configurations.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `options` (`THttpRequestOptions` | undefined)
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
    -   `port` (number)
    -   `sequence` (`TPortSequenceStateSchema[]`)
    -   `options` (`THttpRequestOptions` | undefined)
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

## Application API

### getApplicationList(options?)

Get the list of installed Acap applications.

### startApplication(applicationId, options?)

Start the application whose name is given by the parameter `applicationId`.

### restartApplication(applicationId, options?)

Restart the application whose name is given by the parameter `applicationId`.

### stopApplication(applicationId, options?)

Stop the application whose name is given by the parameter `applicationId`.

### installApplication(data, fileName, options?)
