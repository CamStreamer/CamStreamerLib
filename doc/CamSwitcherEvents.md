# CamSwitcherEvents

Module for receiving CamSwitcher events. Will set up ws connection to the camera.

## Constructor

-   **new CamSwitcherEvents(wsClient)** - Look at the [Client](./Client.md) docs.

```javascript
import { WsEventClient } from 'camstreamerlib/esm/node';
import { CamSwitcherEvents } from 'camstreamerlib/esm';

const cswEvents = new CamSwitcherEvents();
cswevents.setWebsocket(
    new WsEventClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    })
);
```

## Methods

### setWebsocket(ws)

Sets the websocket client for receiving events.

-   **Parameters:**
    -   `ws` (IWebsocket): Websocket client instance.
-   **Returns:** `void`

```javascript
cswEvents.setWebsocket(wsClient);
```

### resendInitData()

Requests the camera to resend initial event data.

-   **Returns:** `void`

```javascript
cswEvents.resendInitData();
```

### addListener(type, listener, id)

Adds a listener for a specific event type.

-   **Parameters:**
    -   `type` (string): Event type (e.g. 'PlaylistSwitch', 'StreamAvailable', ...)
    -   `listener` (function): `(data, isInit) => void` where `data` is the event object and `isInit` is a boolean.
    -   `id` (string): Unique listener ID.
-   **Returns:** `void`

```javascript
cswEvents.addListener(
    'PlaylistSwitch',
    (data, isInit) => {
        // handle event
    },
    'myListenerId'
);
```

### removeListener(type, id)

Removes a listener for a specific event type and ID.

-   **Parameters:**
    -   `type` (string): Event type.
    -   `id` (string): Listener ID.
-   **Returns:** `void`

```javascript
cswEvents.removeListener('PlaylistSwitch', 'myListenerId');
```

### destroy()

Destroys the event handler, closes websocket and removes all listeners.

-   **Returns:** `void`

```javascript
cswEvents.destroy();
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
-   **PlaylistSwitch**
    ```js
    {
        type: 'PlaylistSwitch',
        playlist_name: string
    }
    ```
-   **StreamAvailable**
    ```js
    {
        type: 'StreamAvailable',
        stream_name: string,
        state: boolean
    }
    ```
-   **StreamSwitchAudio**
    ```js
    {
        type: 'StreamSwitchAudio',
        stream_name?: string,
        clip_name?: string,
        master_audio: boolean
    }
    ```
-   **StreamSwitchVideoError**
    ```js
    {
        type: 'StreamSwitchVideoError',
        playlist_name: string,
        playlist_active_stream: number,
        stream_name?: string,
        clip_name?: string,
        info: string
    }
    ```
-   **StreamSwitchAudioError**
    ```js
    {
        type: 'StreamSwitchAudioError',
        stream_name?: string,
        clip_name?: string,
        master_audio: boolean
    }
    ```
-   **StreamSwitchVideo**
    ```js
    {
        type: 'StreamSwitchVideo',
        playlist_active_stream: number,
        stream_name?: string,
        playlist_name?: string,
        clip_name?: string
    }
    ```
-   **PlaylistQueueChange**
    ```js
    {
        type: 'PlaylistQueueChange',
        queue: string[]
    }
    ```
-   **ClipUpload**
    ```js
    {
        type: 'ClipUpload',
        clip_name?: string
    }
    ```
-   **SwitcherStop**
    ```js
    {
        type: 'SwitcherStop',
        default_playlist_id?: string
    }
    ```
-   **SwitcherStart**
    ```js
    {
        type: 'SwitcherStart',
        default_playlist_id?: string
    }
    ```
-   **MediaServerStarted**
    ```js
    {
        type: 'MediaServerStarted';
    }
    ```
-   **ClipRemove**
    ```js
    {
        type: 'ClipRemove',
        clip_name: string
    }
    ```

## Usage Example

```javascript
cswEvents.addListener(
    'PlaylistSwitch',
    (data, isInit) => {
        console.log('Playlist switched to:', data.playlist_name, 'Init:', isInit);
    },
    'listener1'
);
```
