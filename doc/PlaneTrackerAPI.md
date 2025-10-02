# PlaneTrackerAPI

Module for access to the CamOverlay HTTP interface.

## Constructor

-   **new PlaneTrackerAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/esm/node';
import { PlaneTrackerAPI } from 'camstreamerlib/esm';

const ptrApi = new PlaneTrackerAPI(
    new DefaultClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    }),
    apiUser
);
```

> [!IMPORTANT]
> The `apiUser` param is important for correct API behavior

```typescript
type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
};
```

> [!NOTE]
> The majority of PlaneTrackerAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

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

## Static

### getProxyUrlPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const url = PlaneTrackerAPI.getProxyUrlPath();
```

## Methods common

### checkCameraTime(options)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await ptrApi.checkCameraTime();
```

### resetPtzCalibration(options)

-   Resets the PTZ calibration data and restarts the script.
-   The calibration process is started again after the script starts.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.resetPtzCalibration();
```

### resetFocusCalibration(options)

-   Resets the Focus calibration data and restarts the script.
-   The calibration process is started again after the script starts.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.resetFocusCalibration();
```

### serverRunCheck(options)

Checks if the http server is running.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.serverRunCheck();
```

### getLiveViewAlias(rtspUrl, options)

-   **Parameters:**
    -   `rtspUrl` (string)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.serverRunCheck();
```

## Methods - Settings

### fetchCameraSettings(options)

Get the camera settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCameraSettings>`:

```typescript
type TCameraSettings = {
    units: 'metric' | 'imperial';
    adsbSource: { ip: string; port: number };
    camera: {
        ip: string;
        port: number;
        protocol: 'http' | 'https' | 'https_insecure';
        user: string;
        pass: string;
    };
    cameraCalibrationProcessConfig: {
        nightSkyCalibrationEnabled: boolean;
        scheduleNightSkyCalibrationTimestamp: number;
    };
    cameraConfig: {
        defaultCaptureSizeMeters: number;
        captureSizeExtensionMeters: number;
        maxZoomLevel: number | undefined;
    };
    stream: {
        width: number;
        height: number;
    };
    imageConfig: {
        dayAperture: number;
        nightAperture: number;
    };
    airportConfig: {
        icao: string;
        centerLat: number;
        centerLon: number;
        radius: number;
    };
    trackingConfig: {
        prioritizeEmergency: boolean;
    };
    widget: {
        enabled: boolean;
        coord: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
        posX: number;
        posY: number;
        scale: number;
    };
    airportWidget: {
        enabled: boolean;
        coord: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
        posX: number;
        posY: number;
        scale: number;
    };
    fr24FlightInfoSource: {
        enabled: boolean;
        priority: number;
        apiToken: string;
        validateFlights: boolean;
    };
    radarcapeFlightInfoSource: {
        enabled: boolean;
        ip: string;
        port: number;
        priority: number;
    };
    identificationLabel: {
        firstRow: 'icao' | 'blank' | 'registration' | 'call_sign' | 'flight_number';
        secondRow: 'icao' | 'blank' | 'registration' | 'call_sign' | 'flight_number';
        thirdRow: 'icao' | 'blank' | 'registration' | 'call_sign' | 'flight_number';
        fourthRow: 'icao' | 'blank' | 'registration' | 'call_sign' | 'flight_number';
        opacity: number;
    };
    acs: {
        enabled: boolean;
        ip: string;
        port: number;
        protocol: 'http' | 'https' | 'https_insecure';
        user: string;
        pass: string;
        sourceKey: string;
    };
    genetec: {
        enabled: boolean;
        ip: string;
        port: number;
        protocol: 'http' | 'https' | 'https_insecure';
        user: string;
        pass: string;
        baseUri: string;
        appId: string;
        cameraList: string[];
    };
    overlayText:
        | {
              displayIcao: boolean | undefined;
              displayRegistration: boolean | undefined;
              displayFlightNumber: boolean | undefined;
              displayAltitude: boolean | undefined;
              displayVelocity: boolean | undefined;
              displayDistance: boolean | undefined;
              displayFOV: boolean | undefined;
              displayPTError: boolean | undefined;
              displayPTZSpeed: boolean | undefined;
              displayVelocityData: boolean | undefined;
              displaySignalQuality: boolean | undefined;
              displayAutoTrackingInfo: boolean | undefined;
              displayGPSCoords: boolean | undefined;
              displayVapixQuery: boolean | undefined;
              displayFocus: boolean | undefined;
              displayAperture: boolean | undefined;
              displaySunDistance: boolean | undefined;
              displayTickTime: boolean | undefined;
              displayAircraftInfo: boolean | undefined;
          }
        | undefined;
};
```

```javascript
const settings = await ptrApi.fetchCameraSettings();
```

### setCameraSettings(settingsJsonString, options)

Set the camera settings.

-   **Parameters:**
    -   `settingsJsonString` (string)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

    > [!NOTE] > `settingsJsonString` is stringified object of type `TCameraSettings`

```javascript
await ptrApi.setCameraSettings(settingsJson);
```

### fetchServerSettings()

Get the server settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TServerSettings>`:

```typescript
type TServerSettings = {
    cameraCalibration: {
        posLat: number;
        posLon: number;
        geoidHN: number;
        altitudeAmsl: number;
        rotationEast: number;
        rotationNorth: number;
        rotationUp: number;
        tiltTransformationCoefA: number;
        tiltCameraKnownPoint: number;
        tiltRealKnownPoint: number;
    };
};
```

```javascript
const settings = await ptrApi.fetchServerSettings();
```

### exportAppSettings(dataType, options)

Export all settings into a `.zip` file:

-   camera_data:
-   map_data:
-   server_data:

-   **Parameters:**
    -   `dataType` (`'ALL'` | `'NIGHT_SKY_CALIBRATION_DATA'`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Blob>`

### importAppSettings(dataType, formData, options)

Import all settings in a `.zip` file.

-   **Parameters:**
    -   `dataType` (`'MAP_DATA'` | `'SERVER_DATA'` | `'ALL'`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

### Methods - Planes & Tracking

### types

```typescript
//ICAO code of the plane
type ICAO = string;
```

```typescript
type TTrackingMode = {
    mode: 'MANUAL' | 'AUTOMATIC';
};
```

### fetchFlightInfo(icao, options)

Retrieves flight information based on the ICAO code.

-   **Parameters:**
    -   `icao` ([`ICAO`](#types))
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TFlightInfo>`:

```typescript
type TFlightInfo = {
    callsign: string | undefined;
    flightNumber: string | undefined;
    registration: string | undefined;
    aircraftType: string | undefined;
    airlines: string | undefined;
    originAirport:
        | {
              icao: string | undefined;
              iata: string | undefined;
              city: string | undefined;
          }
        | undefined;
    destinationAirport: {
        icao: string | undefined;
        iata: string | undefined;
        city: string | undefined;
    };
    flightImages:
        | {
              src: string | undefined;
              photographer: string | undefined;
          }[]
        | undefined;
};
```

```javascript
const info = await ptrApi.fetchFlightInfo('4BAA66');
```

### startTrackingPlane(icao, options)

-   Tracks a plane by its ICAO code.
-   The plane is tracked even if it is not available in the FlightRadar24 API.
-   When the plane disappears, tracking is reset to the original state.

-   **Parameters:**
    -   `icao` ([`ICAO`](#types))
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.startTrackingPlane('4BAA66');
```

### stopTrackingPlane(options)

Resets the forced tracking of any plane.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.stopTrackingPlane();
```

### getTrackingMode(options)

Gets the current tracking mode settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TTrackingMode>` ([`TTrackingMode`](#types))

```javascript
const mode = await ptrApi.getTrackingMode();
```

### setTrackingMode(modeJsonString, options)

Sets the tracking mode.

-   **Parameters:**

    -   `modeJsonString` (string)
    -   `options` (`THttpRequestOptions` | undefined)

    ```typescript
    JSON.stringify({ mode: 'AUTOMATIC' | 'MANUAL' });
    ```

    > [!NOTE] > `modeJsonString` is stringified object of type [`TTrackingMode`](#types)

-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.setTrackingMode(mode);
```

### Methods - Lists

### Methods - Map & Zones

### Methods - Genetec

### checkGenetecConnection(params, options)

Check the connection to Genetec.

-   **Parameters:**
    -   `params` (Record<string, string | number | boolean | null | undefined>)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<Response | UndiciResponse>`

```javascript
await ptrApi.checkGenetecConnection();
```

### getGenetecCameraList(params, options)

Get the list of cameras available in Genetec.

-   **Parameters:**
    -   `params` (Record<string, string | number | boolean | null | undefined>)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCameraList>`:

    ```typescript
    type TCameraList = {
        value: string;
        index: number;
        label: string;
    }[];
    ```

```javascript
const cameraList = await ptrApi.getGenetecCameraList();
```
