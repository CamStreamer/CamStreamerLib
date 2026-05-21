# PlaneTrackerEvents

Module for receiving PlaneTracker events. Will set up ws connection to the camera.

## Constructor

**new PlaneTrackerEvents(ws: IWsClient, apiUser: Omit\<TApiUser, 'ip'\>)**

```javascript
import { WsClient } from 'camstreamerlib/node';
import { PlaneTrackerEvents } from 'camstreamerlib';

const wsClient = new WsClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
});
const ptrEvents = new PlaneTrackerEvents(wsClient, {
    userId: 'asd',
    userName: 'Asd',
    userPriority: 1,
});
```

-   for `wsClient` - Look at the [Client](./Client.md) docs.
-   `apiUser` identifies the connecting user. The constructor accepts `Omit<TApiUser, 'ip'>`:

```typescript
type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
    ip: string; // assigned by the server; not required in the constructor
};
```

## Attributes

### isDestroyed

boolean if the destroy method was called

## Methods

### resendInitData()

Requests the camera to resend initial event data.

-   **Returns:** `void`

```javascript
ptrEvents.resendInitData();
```

### addListener(type, listener, id)

Adds a listener for a specific event type.

-   **Parameters:**
    -   `type` (`string`): Event type (e.g. 'TRACKING_START', 'StreamAvailable', ...)
    -   `listener` (`function`): `(data, isInit) => void` where `data` is the event object and `isInit` is a boolean.
    -   `id` (`string`): Unique listener ID.
-   **Returns:** `void`

```javascript
ptrEvents.addListener(
    'TRACKING_START',
    (data, isInit) => {
        // handle event
    },
    'myListenerId'
);
```

### removeListener(type, id)

Removes a listener for a specific event type and ID.

-   **Parameters:**
    -   `type` (`string`): Event type.
    -   `id` (`string`): Listener ID.
-   **Returns:** `void`

```javascript
ptrEvents.removeListener('TRACKING_START', 'myListenerId');
```

### removeAllListenersForId(id)

Removes all listeners registered under the given ID across all event types.

-   **Parameters:**
    -   `id` (`string`): Listener ID.
-   **Returns:** `void`

```javascript
ptrEvents.removeAllListenersForId('myListenerId');
```

### destroy()

Destroys the event handler, closes websocket and removes all listeners.

-   **Returns:** `void`

```javascript
ptrEvents.destroy();
```

## Event Types

Supported event types and their data:

-   **CAMERA_POSITION**
    ```js
    {
        type: 'CAMERA_POSITION',
        lat: number,
        lon: number,
        azimuth: number, // min(0) max(360)
        elevation: number, //min(-90) max(90)
        fov: number,
    }
    ```
-   **TRACKING_START**
    ```js
    {
        type: 'TRACKING_START',
        icao: string
    }
    ```
-   **TRACKING_STOP**
    ```js
    {
        type: 'TRACKING_STOP';
    }
    ```
-   **FLIGHT_LIST**
    ```js
    {
        type: 'FLIGHT_LIST',
        list: {
            targetId: string,        // primary target identifier
            icao: string,            // kept for backward compatibility
            domain: 'adsb' | 'remoteId',
            categoryId: string,
            groupId?: string,        // optional group identifier
            lat: number,
            lon: number,
            heading: number,
            groundSpeed: number,     // [km/h]
            altitudeAMSL: number,    // [m]
            cameraDistance: number,  // [m]
            autoTrackingOrder: number,
            whiteListed: boolean,
            blackListed: boolean,
            priorityListed: boolean,
            autoSelectionIgnored: boolean,
            signalQuality: number,
            emitterCategorySet: number,
            emitterCategory: number,
            emergencyState: boolean,
            emergencyStatusMessage: string, // Emergency description
        }[]
    }
    ```
-   **USER_ACTION**

    The shape of `params` and presence of `postJsonBody` varies by `cgi`. Common `EUserActions` values:

    | `cgi` (`EUserActions`)                              | extra `params` fields      | `postJsonBody`       |
    | --------------------------------------------------- | -------------------------- | -------------------- |
    | `trackIcao.cgi` (`TRACK_ICAO`)                      | `icao: string`             | —                    |
    | `trackTarget.cgi` (`TRACK_TARGET`)                  | `targetId: string`         | —                    |
    | `resetIcao.cgi` (`RESET_ICAO`)                      | —                          | —                    |
    | `goToCoordinates.cgi` (`GO_TO_COORDINATES`)         | `lat: string, lon: string` | —                    |
    | `lockApi.cgi` (`LOCK_API`)                          | `timeout: string`          | —                    |
    | `unlockApi.cgi` (`UNLOCK_API`)                      | —                          | —                    |
    | `setPriorityList.cgi` (`SET_PRIORITY_LIST`)         | —                          | priority list object |
    | `setBlackList.cgi` (`SET_BLACK_LIST`)               | —                          | black list object    |
    | `setWhiteList.cgi` (`SET_WHITE_LIST`)               | —                          | white list object    |
    | `setTrackingMode.cgi` (`SET_TRACKING_MODE`)         | —                          | tracking mode object |
    | `setZones.cgi` (`SET_ZONES`)                        | —                          | zones object         |
    | `resetPtzCalibration.cgi` (`RESET_PTZ_CALIBRATION`) | —                          | —                    |

    Base `params` fields (always present):

    ```js
    {
        type: 'USER_ACTION',
        ip: string,
        cgi: string,           // one of EUserActions
        params: {
            userId: string,
            userName: string,
            userPriority: string,
            // ...cgi-specific extra fields
        },
        postJsonBody: any,     // present for list/mode/zones CGIs
    }
    ```

-   **CONNECTED_USERS**
    ```js
    {
        type: 'CONNECTED_USERS',
        users: {
            userId: string,
            userName: string,
            userPriority: number,
            ip: string,
        }
    }
    ```
-   **FORCE_TRACKING_STATUS**
    ```js
    {
        type: 'FORCE_TRACKING_STATUS',
        enabled: boolean,
        icao?: string,
    }
    ```
-   **API_LOCK_STATUS**
    ```js
    {
        type: 'API_LOCK_STATUS',
        isLocked: boolean,
        user?: {
            userId: string,
            userName: string,
            userPriority: number,
            ip: string,
        },
    }
    ```

## Exported Types & Enums

| Old name (≤ v4.0.6)                   | New name (v4.0.7+)        | Notes                               |
| ------------------------------------- | ------------------------- | ----------------------------------- |
| `PlaneTrackerWsEvents` (enum)         | `TEventType` (union type) | Use string literals directly        |
| `PlaneTrackerUserActions` (enum)      | `EUserActions` (enum)     | Same values, renamed                |
| `planeTrackerUserActionData`          | `wsUserActionData`        | Zod schema                          |
| `TPlaneTrackerEvent`                  | `TEventData`              |                                     |
| `TPlaneTrackerEventType`              | `TEventType`              |                                     |
| `TPlaneTrackerEventOfType<T>`         | _(removed)_               | Use `Extract<TEventData, {type:T}>` |
| `TPlaneTrackerApiFlightData`          | `TWsApiFlightData`        |                                     |
| `TPlaneTrackerApiUser`                | `TApiUser`                | Now includes `ip: string`           |
| `TPlaneTrackerStringApiUser`          | _(removed)_               | Internal use only                   |
| `TPlaneTrackerUserActionData`         | `TUserActionData`         |                                     |
| `TPlaneTrackerUserActionDataOfCgi<T>` | `TUserActionDataOfCgi<T>` |                                     |

New types also exported from `camstreamerlib`:

```typescript
// Camera position snapshot (used in CAMERA_POSITION event)
type TWsApiCameraData = {
    lat: number;
    lon: number;
    azimuth: number; // [0, 360]
    elevation: number; // [-90, 90]
    fov: number;
};

// Discriminated union type for all WS events (replaces PlaneTrackerWsEvents enum)
type TEventType =
    | 'CAMERA_POSITION'
    | 'TRACKING_START'
    | 'TRACKING_STOP'
    | 'FLIGHT_LIST'
    | 'USER_ACTION'
    | 'CONNECTED_USERS'
    | 'FORCE_TRACKING_STATUS'
    | 'API_LOCK_STATUS';
```
