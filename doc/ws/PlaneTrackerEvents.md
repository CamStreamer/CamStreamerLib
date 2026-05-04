# PlaneTrackerEvents

Module for receiving PlaneTracker events. Will set up ws connection to the camera.

## Constructor

**new PlaneTrackerEvents(ws: IWsClient<Event>, apiUser: TApiUser)**

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
    userName: 'Asd'.
    userPriority: 1
});
```

-   for `wsClient` - Look at the [Client](./Client.md) docs.
-   `apiUser` is info about the user

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
            icao: string,
            lat: number,
            lon: number,
            heading: number,
            groundSpeed: number, // [km/h]
            altitudeAMSL: number, // [m]
            cameraDistance: number, // [m]
            autoTrackingOrder: number,
            whiteListed: boolean,
            blackListed: boolean,
            priorityListed: boolean,
            typePriorityListed: boolean,
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
    ```js
    {
        type: 'USER_ACTION',
        ip: string,
        params: {
            userId: string,
            userName: string,
            userPriority: number,
        },
        cgi: string,
        postJsonBody: any,
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
-
