# CamStreamerEvents

Module for receiving CamStreamer events. Will set up ws connection to the camera.

## Constructor

**new CamStreamerEvents(ws: IWsClient<Event>, getAuthToken: () => Promise<string>)**

```javascript
import { WsClient } from 'camstreamerlib/node';
import { CamStreamerEvents } from 'camstreamerlib';

const wsClient = new WsClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
});
const csEvents = new CamStreamerEvents(wsClient, () => csAgent.wsAuthorization());
```

-   for `csAgent` - Look at the [CamStreamerAPI](./CamStreamerAPI.md) docs.
-   for `wsClient` - Look at the [Client](./Client.md) docs.

## Attributes

### isDestroyed

boolean if the destroy method was called

## Methods

### resendInitData()

Requests the camera to resend initial event data.

-   **Returns:** `void`

```javascript
csEvents.resendInitData();
```

### addListener(type, listener, id)

Adds a listener for a specific event type.

-   **Parameters:**
    -   `type` (`string`): Event type (e.g. 'StreamState', ...)
    -   `listener` (`function`): `(data, isInit) => void` where `data` is the event object and `isInit` is a boolean.
    -   `id` (`string`): Unique listener ID.
-   **Returns:** `void`

```javascript
csEvents.addListener(
    'StreamState',
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
csEvents.removeListener('StreamState', 'myListenerId');
```

### removeAllListenersForId(id)

Removes all listeners registered under the given ID across all event types.

-   **Parameters:**
    -   `id` (`string`): Listener ID.
-   **Returns:** `void`

```javascript
csEvents.removeAllListenersForId('myListenerId');
```

### destroy()

Destroys the event handler, closes websocket and removes all listeners.

-   **Returns:** `void`

```javascript
csEvents.destroy();
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
-   **StreamState**
    ```js
    {
        type: 'StreamState',
        streamID: number,
        enabled: 0 | 1,
        active: 0 | 1,
        automationState: 0 | 1,
        isStreaming: 0 | 1,
    }
    ```
-   **CS_API_SUCCESS**
    ```js
    {
        type: 'CS_API_SUCCESS',
        apiCall: string,
        message: string,
        streamID: string,
    }
    ```
-   **CS_API_ERROR**
    ```js
    {
        type: 'CS_API_ERROR',
        apiCall: string,
        message: string,
        streamID: string,
        code: string,
    }
    ```
