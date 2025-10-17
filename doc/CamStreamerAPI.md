# CamStreamerAPI

Module for easy control of streaming in the CamStreamer Acap application.

## Constructor

**new CamStreamerAPI(client)** - Look at the [Client](./Client.md) docs

The options parameter contains access to the camera and specifies which protocol should be used. Values mentioned in the example below are default.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamStreamerAPI } from 'camstreamerlib';

const csApi = new CamStreamerAPI(
    new DefaultClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    })
);
```

> [!TIP]
> The majority of CamStreamerAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

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

## Methods - Common

### getClient(proxyParams?)

Returns CamStreamer client - can be used in custom CamStreamer API calls.

-   **Parameters:**

    -   `proxyParams` (`TProxyParams`, optional)

    ```typescript
    type TProxyParams =
        | {
              path: string;
              target: TProxyTarget;
          }
        | undefined;
    ```

-   **Returns:** `Client | ProxyClient<Client>`

```javascript
const client = csApi.getClient();
```

### wsAuthorization(options?)

Gets the WebSocket authorization token to authorize event websocket.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const token = await csApi.wsAuthorization();
```

### getUtcTime(options?)

Get UTC time.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
const utcTime = await csApi.getUtcTime();
```

## Methods - Streams

### types

```typescript
type TStream = {
    enabled: 0 | 1;
    active: 0 | 1;
    audioSource: string;
    avSyncMsec: number;
    internalVapixParameters: string;
    userVapixParameters: string;
    outputParameters: string;
    outputType: 'video' | 'images' | 'none';
    mediaServerUrl: string;
    inputType: 'CSw' | 'CRS' | 'RTSP_URL';
    inputUrl: string;
    forceStereo: 0 | 1;
    streamDelay: number | null;
    statusLed: number;
    statusPort: string;
    callApi: number;
    trigger: string;
    schedule: string;
    prepareAhead: number;
    startTime: number | null;
    stopTime: number | null;
};
```

### getStreamList(options?)

Get info about CamStreamer streams in JSON format.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Record<number, TStream>>` ([`TStream`](#types))

```javascript
const streamList = csApi.getStreamList();
```

### getStream(streamId, options?)

Get info about the CamStreamer stream specified by `streamId`.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStream>` ([`TStream`](#types))

```javascript
const stream = csApi.getStream(id);
```

### getStreamParameter(streamId, paramName, options?)

Get a single parameter of the stream with the specified ID.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `paramName` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const param = csApi.getStreamParameter('1234', 'enabled');
```

### setStream(streamId, params, options?)

Set info about the CamStreamer stream specified by `streamId`.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `params` ([`Partial<TStream>`](#types))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStream('1234', parametes);
```

### setStreamParameter(streamId, paramName, value, options?)

Set the value of the stream parameter.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `paramName` (`string`)
    -   `value` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStreamParameter('1234', 'enabled', '1');
```

### isStreaming(streamId, options?)

Return the state of streaming.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isStreaming = csApi.isStreaming('1234');
```

### deleteStream(streamId, options?)

Delete the CamStreamer stream specified by `streamId`.

-   **Parameters:**
    -   `streamId` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await csApi.deleteStream('1234');
```
