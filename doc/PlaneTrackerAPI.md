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

```typescript
type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
};
```

> [!NOTE]
> The apiUser param is important for correct API behavior

## Static

### getProxyUrlPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const url = PlaneTrackerAPI.getProxyUrlPath();
```

## Methods common

### checkCameraTime()

Check camera time against CamStreamer server.

-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await ptrApi.checkCameraTime();
```

### resetPtzCalibration()

-   Resets the PTZ calibration data and restarts the script.
-   The calibration process is started again after the script starts.

```javascript
await ptrApi.resetPtzCalibration();
```

### serverRunCheck()

Checks if the server is running.

```javascript
await ptrApi.serverRunCheck();
```

### getLiveViewAlias(rtspUrl)

## Methods - Settings

### fetchCameraSettings()

### setCameraSettings(settingsJsonString)

### fetchServerSettings()

### exportAppSettings(dataType)

### importAppSettings(dataType, formData)

### Methods - Planes & Tracking

### fetchFlightInfo(icao)

### startTrackingPlane(icao)

-   Tracks a plane by its ICAO code.
-   The plane is tracked even if it is not available in the FlightRadar24 API.
-   When the plane disappears, tracking is reset to the original state.

-   **Parameters:**
    -   `icao` (string):

### stopTrackingPlane()

### getTrackingMode()

Gets the current tracking mode settings.

### setTrackingMode(modeJsonString)

Sets the tracking mode.

-   **Parameters:**

    -   `modeJsonString` (string):

    ```typescript
    JSON.stringify({ mode: 'AUTOMATIC' | 'MANUAL' });
    ```

```javascript
await ptrApi.setTrackingMode(mode);
```
