# CamStreamerAPI

Module for easy control of streaming in the CamStreamer Acap application.

## Overview

-   [Constructor](#constructor)
-   [Methods](#static-methods)
    -   [Static](#static-methods)
    -   [Common](#common-methods)
    -   [Stream Management](#stream-management-methods): Manage streams.
    -   [Stream Statistics](#stream-statistics-methods): Get stream statistics data.
    -   [Audio Files Management](#audio-files-management-methods): Manage audio files.

<br/>

## Constructor

**new CamStreamerAPI(client)** - Look at the [Client](./Client.md) docs

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamStreamerAPI } from 'camstreamerlib';

const csApi = new CamStreamerAPI(new DefaultClient());
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

<br/>

## Static methods

### getProxyPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const path = CamStreamerAPI.getProxyPath();
```

### getWsEventsPath()

Returns relative path for event websocket

-   **Returns:** `string`

```javascript
const path = CamStreamerAPI.getWsEventsPath();
```

<br />

## Common Methods

### getClient(proxyParams?)

Returns CamStreamer client - can be used in custom CamStreamer API calls.

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
const client = csApi.getClient();
```

### checkAPIAvailable(options?)

Dummy endpoint to check if API is available.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.checkAPIAvailable();
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

### getMaxFps(source?, options?)

Get maximum available frame rate of given video source.

> [!IMPORTANT]
> Use this method only for cameras with <b>FW lower that 8.50</b>

-   **Parameters:**
    -   `source` (`number`, optional, default = `0`): Video source number.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
const maxFps = await csApi.getMaxFps(1);
```

### isCSPassValid(pass, options?)

Check password for camstreamer user.

-   **Parameters:**
    -   `pass` (`string`): Camera password.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await csApi.isCSPassValid('some-pass-123');
```

### getCamStreamerAppLog(options?)

Get last CamStreamer app logs.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const log = await csApi.getCamStreamerAppLog();
```

### downloadReport(options?)

Get application report data.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await csApi.downloadReport();
```

<br />

## Stream Management Methods

### types

```typescript
type TStream = {
    platform: string;
    streamId: string;
    enabled: boolean;
    active: boolean;
    title: string;
    trigger:
        | {
              type: 'manual';
              port: number | undefined;
          }
        | {
              type: 'onetime';
              startTime: number;
              stopTime: number;
              everActivated: boolean;
              prepareAheadS: number | undefined;
          }
        | {
              type: 'recurrent';
              schedule: {
                  start: {
                      day: number;
                      timeS: number;
                  };
                  stop: {
                      day: number;
                      timeS: number;
                  };
                  isActive: boolean;
              }[];
              prepareAheadS: number | undefined;
          };
    video: {
        output:
            | {
                  type: 'video';
                  url: string | null;
                  parameters: string;
                  saveToSdCard: { ruleId: string; configurationId: string } | undefined;
              }
            | {
                  type: 'images';
                  url: string | null;
                  imageIntervalS: number;
              }
            | {
                  type: 'none';
                  saveToSdCard: { ruleId: string; configurationId: string };
              };
        input:
            | {
                  type: 'RTSP_URL';
                  url: string;
                  internalVapixParameters: string;
              }
            | {
                  type: 'CSw';
              }
            | {
                  type: 'CRS';
                  internalVapixParameters: string;
                  userVapixParameters: string;
              };
        delayS: number | undefined;
    };
    audio:
        | {
              source: 'none';
          }
        | {
              source: 'microphone';
              forceStereo: boolean;
              audioChannelNbr: number;
          }
        | {
              source: 'file';
              path: string;
              name: string;
              forceStereo: boolean;
          }
        | {
              source: 'url';
              name: string;
              url: string;
              avSyncMsec: number;
              forceStereo: boolean;
          };
    status: {
        led: boolean;
        port: number | undefined;
    };
};

type TUnknownStream = {
    platform: string;
    [key: string]: unknown; // other custom params
};
```

### getStreamList(options?)

List all stream configurations.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<(TStream | TUnknownStream)[]>` ([`TStream`](#types))

```javascript
const streamList = await csApi.getStreamList();
```

### setStreamList(streamList, options?)

Set list of stream configurations.

-   **Parameters:**
    -   `streamData` ([`(TStream | TUnknownStream)[]`](#types)): Stream data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStreamList([]);
```

### getStream(streamId, options?)

Get stream settings/config.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStream>` ([`TStream`](#types))

```javascript
const stream = await csApi.getStream('5874');
```

### setStream(streamId, streamData, options?)

Set stream settings/config.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `streamData` ([`TStream`](#types)): Stream data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStream('5874', { ...someData });
```

### setStreamEnabled(streamId, enabled, options?)

Update stream enabled parameter.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `enabled` (`boolean`): State of enabled to be set (true = enabled, false = disabled).
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStreamEnabled('5874', false);
```

### setStreamActive(streamId, active, options?)

Update stream active parameter.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `active` (`boolean`): State of active to be set (true = active, false = inactive).
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.setStreamActive('5874', true);
```

<br />

## Stream Statistics Methods

### getStreamNetworkStatistics(streamId, options?)

Get status of the stream.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStreamStats>`

    ```typescript
    type TStreamStats = {
        net_stats: string;
        stream_bytes_time_ms: number;
        stream_bytes: number;
        start_count: number;
        is_streaming: 0 | 1;
    };
    ```

```javascript
const stats = await csApi.getStreamNetworkStatistics('5874');
```

### getSrtStreamStatistics(streamId, options?)

Get SRT protocol statistics for given stream.

-   **Parameters:**
    -   `streamId` (`string`): Id of the stream.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TSrtStreamStatistics>`

    ```typescript
    type TStreamStats = {
        msTimeStamp: number;
        pktSentTotal: number;
        byteSentTotal: number;
        pktRetransTotal: number;
        byteRetransTotal: number;
        pktSndDropTotal: number;
        byteSndDropTotal: number;
        mbpsSendRate: number;
        mbpsBandwidth: number;
        mbpsMaxBW: number;
        msRTT: number;
        msSndBuf: number;
    };
    ```

```javascript
const srtStats = await csApi.getSrtStreamStatistics('5874');
```

### getDiagnostics(params, options?)

Get application report data.

-   **Parameters:**

    -   `params` (`TDiagnosticsParams`)

    ```typescript
    type TDiagnosticsParams = {
        camerainfo: boolean | undefined;
        checkserver: boolean | undefined;
        checkservertime: boolean | undefined;
        speedtest: boolean | undefined;
        pingtest: boolean | undefined;
        videoHostPort: string | undefined;
        audioHostPort: string | undefined;
    };
    ```

    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<TDiagnostics>`

    ```typescript
    type TDiagnostics = {
        status: number;
        message: string;
        data: {
            videoHostPort:
                | {
                      code: number;
                      message: string;
                  }
                | undefined;
            audioHostPort:
                | {
                      code: number;
                      message: string;
                  }
                | undefined;
            cameraInfo:
                | {
                      uptime: string;
                      availableRAM: number;
                      availableInternal: number;
                  }
                | undefined;
            checkServer:
                | {
                      code: number;
                      message: string;
                  }
                | undefined;
            checkServerTime:
                | {
                      code: number;
                      message: string;
                  }
                | undefined;
            speedTest:
                | {
                      code: string;
                      data: {
                          timestamp: number;
                          speed: number;
                      }[];
                  }
                | undefined;
            pingTest:
                | {
                      output: string;
                  }
                | undefined;
        };
    };
    ```

```javascript
const diagnostics = await csApi.getDiagnostics();
```

<br />

## Audio Files Management Methods

### types

```typescript
type TAudioFile = {
    path: string; // path to the file
    name: string; // file name
    storage: 'url' | 'flash' | 'SD0'; // file storage
};
```

### listFiles(options?)

Get list of audio files.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TAudioFile[]>`](#types-1)

```javascript
const files = await csApi.listFiles();
```

### uploadFile(formData, storage, options?)

Upload audio file.

-   **Parameters:**
    -   `formData` (`Parameters<Client['post']>[0]['data']`): e.g. string, FormData, ArrayBuffer
    -   `storage` (`"url" | "flash" | "SD0"`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await csApi.uploadFile(fileData, 'url');
```

### removeFile(fileParams, options?)

Remove audio file.

-   **Parameters:**
    -   `fileParams` ([`TAudioFile`](#types-1))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await csApi.removeFile({
    name: 'audio1',
    path: 'http://youtube.com/sahorhaXSIDyyf',
    storage: 'url',
});
```

### getFileStorage(options?)

Get available storage on camera.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStorageList>`

    ```typescript
    type TStorageList = (
        | {
              type: 'flash';
              flash: string;
          }
        | {
              type: 'SD0';
              SD0: string;
          }
    )[];
    ```

```javascript
const storage = await csApi.getFileStorage();
```

### getFileFromCamera(path, options?)

Get audio file as Blob.

-   **Parameters:**
    -   `path` (`string`): Path to the audio file.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

```javascript
await csApi.getFileFromCamera('file://path-to-file/audio.mp3');
```
