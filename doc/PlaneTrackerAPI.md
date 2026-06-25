# PlaneTrackerAPI

Module for access to the PlaneTracker HTTP interface.

## Overview

-   [Constructor](#constructor)
-   [Methods](#static-methods)
    -   [Static](#static-methods)
    -   [Common](#common-methods)
    -   [Calibration](#calibration-methods): Manage camera calibration.
    -   [Settings](#settings-methods): Manage settings.
    -   [Planes & Tracking](#planes--tracking-management-methods): Manage Planes and Tracking mode.
    -   [Map & Zones](#map--zones-management-methods): Manage Map and Zones.
    -   [Genetec](#genetec-management-methods): Manage connection to Genetec.

<br/>

## Constructor

-   **new PlaneTrackerAPI(client, apiUser)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { PlaneTrackerAPI } from 'camstreamerlib';

const ptrApi = new PlaneTrackerAPI(new DefaultClient(), {
    userId: 'asd',
    userName: 'Asd',
    userPriority: 1,
});
```

> [!IMPORTANT]
> The `apiUser` param is important for correct API behavior

The constructor accepts `Omit<TApiUser, 'ip'>`. `TApiUser` is exported from `camstreamerlib` (defined in `PlaneTrackerEvents` types) and has the following shape:

```typescript
type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
    ip: string; // assigned by the server; not required in the constructor
};
```

<br/>

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

<br/>

## Static Methods

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

<br/>

## Common Methods

### getClient(proxyParams?)

Returns PlaneTracker client - can be used in custom PlaneTracker API calls.

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

### checkAPIAvailable(options?)

Dummy endpoint to check if API is available.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.checkAPIAvailable();
```

### checkCameraTime(options?)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await ptrApi.checkCameraTime();
```

### serverRunCheck(options?)

Checks if the http server is running.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<boolean>`](#common-types)

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

<br/>

## Calibration Methods

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

### triggerFocusReview(options?)

-   Requests a focus review tour and restarts the script.
-   On the next start the script guard-tours through each configured focus calibration point, dwelling at the minimum and maximum calibrated focus on each point while showing an overlay describing the step, then restarts and resumes normal operation.
-   Requires focus calibration data to be available; otherwise a `BadRequestError` is thrown.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.triggerFocusReview();
```

<br/>

## Settings Methods

### fetchCameraSettings(options?)

Get the camera settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TCameraSettings>`:

```typescript
type TCameraSettings = {
    units: 'metric' | 'imperial';
    adsbSource: { enabled: boolean; ip: string; port: number };
    dronetagSource: { enabled: boolean };
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
        focusCalibrationPoints: string;
    };
    cameraConfig: {
        defaultCaptureSizeMeters: number;
        captureSizeExtensionMeters: number;
    };
    stream: {
        width: number;
        height: number;
    };
    imageConfig: {
        dayAperture: number;
        nightAperture: number;
        maxGain: number;
    };
    airportConfig: {
        icao: string;
        centerLat: number;
        centerLon: number;
        radius: number;
    };
    trackingConfig: {
        prioritizeEmergency: boolean;
        trackingZoneWeightIncrease: number;
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
    camstreamerIntegration: {
        adPlacementEnabled: boolean;
        adMinIntervalSec: number;
        adShortDurationSec: number;
        adLongDurationSec: number;
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
              displayAdsbVelocityData: boolean | undefined;
              displaySignalQuality: boolean | undefined;
              displayAutoTrackingInfo: boolean | undefined;
              displayGPSCoords: boolean | undefined;
              displayVapixQuery: boolean | undefined;
              displayFocus: boolean | undefined;
              displayAperture: boolean | undefined;
              displaySunDistance: boolean | undefined;
              displayTickTime: boolean | undefined;
              displayAircraftInfo: boolean | undefined;
              displaySystemInfo: boolean | undefined;
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
-   **Returns:** `Promise<void>`

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
        panErrorCorrection: {
            cameraPan: number;
            realPan: number;
        }[];
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

### getDomainList(options?)

Returns a list of available tracking domains and their target categories.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TDomainList>`:

```typescript
type TDomainId = 'adsb' | 'remoteId';

type TCategoryIcon = 'small' | 'large' | 'heavy' | 'helicopter' | 'drone' | 'operator' | 'unknown';

type TCategoryDescriptor = {
    categoryId: string;
    uiName: string;
    icon: TCategoryIcon;
};

type TDomainDescriptor = {
    uiName: string;
    icon: TCategoryIcon;
    categoryList: TCategoryDescriptor[];
};

type TDomainList = Record<TDomainId, TDomainDescriptor>;
```

```javascript
const domainList = await ptrApi.getDomainList();
```

<br/>

## Planes & Tracking Management Methods

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

### fetchFlightInfo(targetId, options?)

Retrieves flight information for the given target.

-   **Parameters:**
    -   `targetId` (`string`): The target ID of the plane.
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
const info = await ptrApi.fetchFlightInfo('target-123');
```

### startTrackingTarget(targetId, options?)

-   Tracks a target by its target ID.
-   The target is tracked even if it is not available in the FlightRadar24 API.
-   When the target disappears, tracking is reset to the original state.

-   **Parameters:**
    -   `targetId` (`string`): The target ID of the plane to track.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.startTrackingTarget('target-123');
```

### stopTrackingTarget(options?)

Resets the forced tracking of any target.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.stopTrackingTarget();
```

### startTrackingPlane(icao, options?) ⚠️ Deprecated

> [!WARNING]
> Deprecated — kept for backwards compatibility. Use [`startTrackingTarget`](#starttrackingtargettargetid-options) instead. Will be removed in a future major release.

-   **Parameters:**
    -   `icao` ([`ICAO`](#types)): The ICAO code of the plane to track.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.startTrackingPlane('4BAA66');
```

### stopTrackingPlane(options?) ⚠️ Deprecated

> [!WARNING]
> Deprecated — kept for backwards compatibility. Use [`stopTrackingTarget`](#stoptrackingtargetoptions) instead. Will be removed in a future major release.

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

Returns the ICAO code (targetId) for a given registration or callsign.

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
type TListEntry = {
    domain: 'adsb' | 'remoteId';
    idType: 'icao' | 'type_icao' | 'drone_mac' | 'operator_mac' | 'category';
    idValue: string;
};

type TPriorityListEntry = TListEntry & {
    priority: number;
};

type TWhiteList = {
    list: TListEntry[];
};

type TBlackList = {
    list: TListEntry[];
};

type TPriorityList = {
    list: TPriorityListEntry[];
};
```

### get(options?)

Get white/black/priority list.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TWhiteList>`, `Promise<TBlackList>`, `Promise<TPriorityList>`

```javascript
const priorityList = await ptrApi.getPriorityList();
const whiteList = await ptrApi.getWhiteList();
const blackList = await ptrApi.getBlackList();
```

### set(list, options?)

Set white/black/priority list.

-   **Parameters:**
    -   `whiteList` (`TWhiteList`): White list object.
    -   `blackList` (`TBlackList`): Black list object.
    -   `priorityList` (`TPriorityList`): Priority list object.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await ptrApi.setWhiteList({ list: [{ domain: 'adsb', idType: 'icao', idValue: '4BAA66' }] });
await ptrApi.setBlackList({ list: [{ domain: 'adsb', idType: 'icao', idValue: '4B5288' }] });
await ptrApi.setPriorityList({
    list: [
        { domain: 'adsb', idType: 'icao', idValue: '4BAA66', priority: 1 },
        { domain: 'adsb', idType: 'icao', idValue: '4BCI62', priority: 2 },
    ],
});
```

<br/>

## Map & Zones Management Methods

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
            flightDirection: 'all' | 'arrival' | 'departure';
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

<br/>

## Genetec Management Methods

> [!TIP]
> for more information see [GenetecAgent](GenetecAgent.md)

```typescript
type TParameters = {
    [key: string]: string | number | boolean | null | undefined;
};
```

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

-   **Returns:** `Promise<boolean>`

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
