# CamOverlayEvents

Module for receiving CamOverlay events. Will set up ws connection to the camera.

## Constructor

**new CamOverlayEvents(ws: IWsClient<Event>, getAuthToken: () => Promise<string>)**

```javascript
import { WsClient } from 'camstreamerlib/node';
import { CamOverlayEvents } from 'camstreamerlib';

const wsClient = new WsClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
});
const coEvents = new CamOverlayEvents(wsClient, () => coAgent.wsAuthorization());
```

-   for `coAgent` - Look at the [CamOverlayAPI](./CamOverlayAPI.md) docs.
-   for `wsClient` - Look at the [Client](./Client.md) docs.

## Attributes

### isDestroyed

boolean if the destroy method was called

## Methods

### resendInitData()

Requests the camera to resend initial event data.

-   **Returns:** `void`

```javascript
coEvents.resendInitData();
```

### addListener(type, listener, id)

Adds a listener for a specific event type.

-   **Parameters:**
    -   `type` (`string`): Event type (e.g. 'ServiceStart', ...)
    -   `listener` (`function`): `(data, isInit) => void` where `data` is the event object and `isInit` is a boolean.
    -   `id` (`string`): Unique listener ID.
-   **Returns:** `void`

```javascript
coEvents.addListener(
    'ServiceStart',
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
coEvents.removeListener('ServiceStart', 'myListenerId');
```

### removeAllListenersForId(id)

Removes all listeners registered under the given ID across all event types.

-   **Parameters:**
    -   `id` (`string`): Listener ID.
-   **Returns:** `void`

```javascript
coEvents.removeAllListenersForId('myListenerId');
```

### destroy()

Destroys the event handler, closes websocket and removes all listeners.

-   **Returns:** `void`

```javascript
coEvents.destroy();
```

## Event Types

Supported event types and their data:

-   **authorization**
    ```js
    {
        type: 'authorization',
        state: string
    }
    ```
-   **ServiceStart**
    ```js
    {
        type: 'ServiceStart',
        serviceId: number
    }
    ```
-   **ServiceStop**
    ```js
    {
        type: 'ServiceStop',
        serviceId: number
    }
    ```
