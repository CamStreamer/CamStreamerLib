# PlaneTrackerAPI

Module for access to the CamOverlay HTTP interface.

## Constructor

-   **new PlaneTrackerAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { PlaneTrackerAPI } from 'camstreamerlib';

const ptrApi = new PlaneTrackerAPI(
    new DefaultClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    }),
    {
        userId: 'asd',
        userName: 'Asd'.
        userPriority: 1
    }
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

### Common types

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
> The majority of PlaneTrackerAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

```typescript
type THttpRequestOptions = {
    timeout?: number; // in miliseconds
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

### getProxyPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const path = PlaneTrackerAPI.getProxyPath();
```

### getWsEventsPath()

Returns relative path for event websocket

-   **Returns:** `string`

```javascript
const path = PlaneTrackerAPI.getWsEventsPath();
```

## Methods - Common

### getClient(proxyParams?)

Returns CamOverlay client - can be used in custom CamOverlay API calls.

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
const client = ptrApi.getClient();
```

### checkCameraTime(options?)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await ptrApi.checkCameraTime();
```

### resetPtzCalibration(options?)

-   Resets the PTZ calibration data and restarts the script.
-   The calibration process is started again after the script starts.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.resetPtzCalibration();
```

### resetFocusCalibration(options?)

-   Resets the Focus calibration data and restarts the script.
-   The calibration process is started again after the script starts.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.resetFocusCalibration();
```

### serverRunCheck(options?)

Checks if the http server is running.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TResponse>`](#common-types)

```javascript
await ptrApi.serverRunCheck();
```

### getLiveViewAlias(rtspUrl, options?)

-   **Parameters:**
    -   `rtspUrl` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:**

    ```typescript
    Promise<{
        alias: string;
        ws: string;
        ws_initial_message: string;
    }>;
    ```

```javascript
const data = await ptrApi.getLiveViewAlias(url);
```

## Methods - Settings

### fetchCameraSettings(options?)

Get the camera settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
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
        guardTourEnabled: boolean;
        guardTourId: number;
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

### setCameraSettings(settings, options?)

Set the camera settings.

-   **Parameters:**
    -   `settings` (`TCameraSettings`): Camera settings configuration.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TResponse>`](#common-types)

```javascript
await ptrApi.setCameraSettings(settings);
```

### fetchServerSettings(options?)

Get the server settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
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

### exportAppSettings(dataType, options?)

Export all settings into a `.zip` file:

-   `camera_data`: Camera settings - see `TCameraSettings` type.
-   `map_data`: Map info data, images of map tiles.
-   `server_data`: Server settings - see `TServerSettings` type.

-   **Parameters:**
    -   `dataType` (`'ALL'` | `'NIGHT_SKY_CALIBRATION_DATA'`): Specifies which type of data to export.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

### importAppSettings(dataType, formData, options?)

Import all settings in a `.zip` file.

-   **Parameters:**
    -   `dataType` (`'MAP_DATA'` | `'SERVER_DATA'` | `'ALL'`): Specifies which type of data to import.
    -   `formData` (`Parameters<Client['post']>[0]['data']`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

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

### fetchFlightInfo(icao, options?)

Retrieves flight information based on the ICAO code.

-   **Parameters:**
    -   `icao` ([`ICAO`](#types)): The ICAO code of the plane.
    -   `options` (`THttpRequestOptions`, optional)
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

### startTrackingPlane(icao, options?)

-   Tracks a plane by its ICAO code.
-   The plane is tracked even if it is not available in the FlightRadar24 API.
-   When the plane disappears, tracking is reset to the original state.

-   **Parameters:**
    -   `icao` ([`ICAO`](#types)): The ICAO code of the plane to track.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.startTrackingPlane('4BAA66');
```

### stopTrackingPlane(options?)

Resets the forced tracking of any plane.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.stopTrackingPlane();
```

### getTrackingMode(options?)

Gets the current tracking mode settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TTrackingMode>` ([`TTrackingMode`](#types))

```javascript
const mode = await ptrApi.getTrackingMode();
```

### setTrackingMode(mode, options?)

Sets the tracking mode.

-   **Parameters:**
    -   `mode` ([`TTrackingMode['mode']`](#types)): Tracking mode.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.setTrackingMode('AUTOMATIC');
```

### getIcao(by, value, options?)

Returns the ICAO code for a given registration or callsign.

-   **Parameters:**

    -   `by` (`'registration' | 'callsign'`): Specifies the method used to identify the plane

        -   Use `'registration'` to search by the aircraft's registration number
        -   or `'callsign'` to search by its callsign

    -   `value` (`string`): Value of the registration or callsign.
    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<string>`

```javascript
const icao = await ptrApi.getIcao('registration', 'OKFHS');
```

### Methods - Lists

```typescript
type TPriorityList = {
    priorityList: string[];
};

type TWhiteList = {
    whiteList: string[];
};

type TBlackList = {
    blackList: string[];
};
```

### get(options?)

Get list of ICAOs in priority/typePriority/white/black list.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TPriorityList['priorityList']>`, `Promise<TTypePriorityList['typePriorityList']>`, `Promise<TWhiteList['whiteList']>`, `Promise<TBlackList['blackList']>`

```javascript
const priorityList = await ptrApi.getPriorityList();
const typePriorityList = await ptrApi.getTypePriorityList();
const whiteList = await ptrApi.getWhiteList();
const blackList = await ptrApi.getBlackList();
```

### set(list, options?)

Add ICAO to priority/typePriority/white/black list.

-   **Parameters:**
    -   `priorityList` (`TPriorityList['priorityList']`): List of planes in priority list.
    -   `typePriorityList` (`TTypePriorityList['typePriorityList']`): List of planes in type priority list.
    -   `whiteList` (`TWhiteList['whiteList']`): List of planes in white list.
    -   `blackList` (`TBlackList['blackList']`): List of planes in black list.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TResponse>`](#common-types)

```javascript
await ptrApi.setWhiteList(['4BAA66']);
await ptrApi.setBlackList(['4B5288']);
await ptrApi.setPriorityList(['4BAA66', '4BCI62', '4B5288']);
await ptrApi.setTypePriorityList(['4BAA66', '4BCI62', '4B5288']);
```

### Methods - Map & Zones

### fetchMapInfo(options?)

Gets the current tracking mode settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TMapInfo>`

    ```typescript
    type TMapInfo = {
        minZoom: number;
        maxZoom: number;
        mapTypes: ('roadmap' | 'satellite')[];
        tileSize: number;
    };
    ```

```javascript
const mapInfo = await ptrApi.fetchMapInfo();
```

### getZones(options?)

Gets zones config.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TZones>`

    ```typescript
    type TZones = {
        zones: {
            enabled: boolean;
            area: [
                {
                    lat: number;
                    lon: number;
                },
                ...{
                    lat: number;
                    lon: number;
                }[]
            ];
            weight: number;
            name?: string | undefined;
            minAltitudeAmsl?: number | undefined;
            maxAltitudeAmsl?: number | undefined;
            minSpeedKmph?: number | undefined;
            maxSpeedKmph?: number | undefined;
        }[];
    };
    ```

```javascript
const zones = await ptrApi.getZones();
```

### setZones(zones, options?)

Update zones config.

-   **Parameters:**
    -   `zones` (`TZones`): Configuration of the zones.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.setZones(zones);
```

### goToCoordinates(lat, lon, alt?, options?)

Focus camera to specified coordinates.

-   **Parameters:**
    -   `lat` (`number`): Latitude of the target location.
    -   `lon` (`number`): Longitude of the target location.
    -   `alt` (`number`, optional): Altitude of the target location (meters). If not provided, it will be fetched from the elevation service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.goToCoordinates();
```

### Methods - Genetec

> [!TIP]
> for more information see [GenetecAgent](GenetecAgent.md)

### checkGenetecConnection(params, options?)

Check the connection to Genetec.

-   **Parameters:**

    -   `params` ([`TParameters`](#common-types)): Genetec data, example:

    ```typescript
    const params = {
        protocol: 'http'
        ip: '127.0.0.1';
        port: 80;
        baseUri: 'WebSdk';
        appId: 'someAppId';
        user: 'userName';
        pass: 'password';
    };
    ```

    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** [`Promise<TResponse>`](#common-types)

```javascript
await ptrApi.checkGenetecConnection();
```

### getGenetecCameraList(params, options?)

Get the list of cameras available in Genetec.

-   **Parameters:**

    -   `params` ([`TParameters`](#common-types)): Genetec data, example:

    ```typescript
    const params = {
        protocol: 'http'
        ip: '127.0.0.1';
        port: 80;
        baseUri: 'WebSdk';
        appId: 'someAppId';
        user: 'userName';
        pass: 'password';
    };
    ```

    -   `options` (`THttpRequestOptions`, optional)

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
