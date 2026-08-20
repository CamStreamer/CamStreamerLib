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
    host: '127.0.0.1',
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

> **Not supported by PlaneTracker.**

### addListener(type, listener, id)

Adds a listener for a specific event type.

-   **Parameters:**
    -   `type` (`TEventType`): Event type (e.g. `'TRACKING_START'`, `'FLIGHT_LIST'`, … — see [Event Types](#event-types))
    -   `listener` (`function`): `(data, isInit) => void` where `data` is the event object and `isInit` is a boolean.
        PlaneTracker sends initial state as ordinary events (no `{type: 'init'}` envelope), so `isInit` is always `false`.
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

The PlaneTracker ACAP emits exactly these event types (`TEventType`)

-   **CAMERA_POSITION**
    ```js
    {
        type: 'CAMERA_POSITION',
        lat: number,
        lon: number,
        azimuth: number,    // min(0) max(360)
        elevation: number,  // min(-90) max(90)
        fov: number,
        sampledAt: number,  // epoch ms when the PTZ angles were sampled — enables time-accurate, continuous cone animation
    }
    ```
-   **TRACKING_START**
    ```js
    {
        type: 'TRACKING_START',
        targetId: string,   // primary target identifier
        icao: string,       // same value as targetId; kept for backward compatibility (e.g. Genetec)
        domain: 'adsb' | 'remoteId',
        categoryId: string,
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
            lat: number,             // estimated/extrapolated current position (legacy; external consumers rely on this)
            lon: number,
            observedLat: number,     // raw observation position (un-extrapolated)
            observedLon: number,
            positionTimestamp: number, // epoch ms of the raw observation — pairs with observedLat/observedLon
            heading: number,
            groundSpeed: number,     // [km/h]
            altitudeAMSL: number,    // [m]
            cameraDistance: number,  // [m]
            autoTrackingOrder: number | null, // 1-based rank in the automatic selection order (1 = best candidate); null when excluded from automatic selection
            whiteListed: boolean,
            blackListed: boolean,
            priorityListed: boolean,
            friendlyListed: boolean,
            autoSelectionIgnored: boolean,
            signalQuality: number,
            emitterCategorySet: number, // default 4
            emitterCategory: number,    // default 3
            emergencyState: boolean,
            emergencyStatusMessage: string, // Emergency description
        }[]
    }
    ```
-   **USER_ACTION**

    Broadcast whenever any user calls a state-changing CGI. The shape of `params` and the presence of
    `postJsonBody` varies by `cgi`. All `EUserActions` values:

    | `cgi` (`EUserActions`)                              | extra `params` fields      | `postJsonBody`                         |
    | --------------------------------------------------- | -------------------------- | -------------------------------------- |
    | `trackIcao.cgi` (`TRACK_ICAO`)                      | `icao: string`             | —                                      |
    | `trackTarget.cgi` (`TRACK_TARGET`)                  | `targetId: string`         | —                                      |
    | `resetIcao.cgi` (`RESET_ICAO`)                      | —                          | —                                      |
    | `resetTarget.cgi` (`RESET_TARGET`)                  | —                          | —                                      |
    | `goToCoordinates.cgi` (`GO_TO_COORDINATES`)         | `lat: string, lon: string` | —                                      |
    | `lockApi.cgi` (`LOCK_API`)                          | `timeout: string`          | —                                      |
    | `unlockApi.cgi` (`UNLOCK_API`)                      | —                          | —                                      |
    | `setPriorityList.cgi` (`SET_PRIORITY_LIST`)         | —                          | `priorityListSchema` (`TPriorityList`) |
    | `setBlackList.cgi` (`SET_BLACK_LIST`)               | —                          | `blackListSchema` (`TBlackList`)       |
    | `setWhiteList.cgi` (`SET_WHITE_LIST`)               | —                          | `whiteListSchema` (`TWhiteList`)       |
    | `setFriendlyList.cgi` (`SET_FRIENDLY_LIST`)         | —                          | `friendlyListSchema` (`TFriendlyList`) |
    | `setTrackingMode.cgi` (`SET_TRACKING_MODE`)         | —                          | `trackingModeSchema` (`TTrackingMode`) |
    | `setZones.cgi` (`SET_ZONES`)                        | —                          | `zonesSchema` (`TZones`)               |
    | `resetPtzCalibration.cgi` (`RESET_PTZ_CALIBRATION`) | —                          | —                                      |

    Base `params` fields (always present):

    ```js
    {
        type: 'USER_ACTION',
        ip: string,
        cgi: string,           // one of EUserActions
        params: {
            userId: string,
            userName: string,
            userPriority: string, // query-string value, hence a string
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
        }[]
    }
    ```
-   **FORCE_TRACKING_STATUS**
    ```js
    {
        type: 'FORCE_TRACKING_STATUS',
        enabled: boolean,
        targetId?: string,
        icao?: string,      // same value as targetId; kept for backward compatibility
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

Exported from `camstreamerlib`:

| Export                    | Kind       | Description                                                      |
| ------------------------- | ---------- | ---------------------------------------------------------------- |
| `TEventType`              | union type | All event type string literals                                   |
| `TEventData`              | union type | Discriminated union of all event payloads                        |
| `EUserActions`            | enum       | CGI names carried by `USER_ACTION`                               |
| `ptrEventsSchema`         | zod schema | Validates an incoming message (event, or `{type: 'init', data}`) |
| `TWsUserActionData`       | type       | `Extract<TEventData, { type: 'USER_ACTION' }>`                   |
| `TUserActionDataOfCgi<T>` | type       | The `USER_ACTION` variant for a single `EUserActions` value      |
| `TWsApiFlightData`        | type       | One entry of the `FLIGHT_LIST` `list`                            |
| `TWsApiCameraData`        | type       | `CAMERA_POSITION` payload without `type`                         |
| `TApiUser`                | type       | Connected user (`userId`, `userName`, `userPriority`, `ip`)      |

```typescript
type TEventType =
    | 'CAMERA_POSITION'
    | 'TRACKING_START'
    | 'TRACKING_STOP'
    | 'FLIGHT_LIST'
    | 'USER_ACTION'
    | 'CONNECTED_USERS'
    | 'FORCE_TRACKING_STATUS'
    | 'API_LOCK_STATUS';

// Camera position snapshot (used in CAMERA_POSITION event)
type TWsApiCameraData = {
    lat: number;
    lon: number;
    azimuth: number; // [0, 360]
    elevation: number; // [-90, 90]
    fov: number;
    sampledAt: number; // epoch ms
};
```
