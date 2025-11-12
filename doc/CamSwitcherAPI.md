# CamSwitcherAPI

Module for access to the CamSwitcher HTTP interface.

## Constructor

**new CamSwitcherAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamSwitcherAPI } from 'camstreamerlib';

const cswApi = new CamSwitcherAPI(
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
> The majority of CamSwitcherAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

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

## Static

### getProxyPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const path = CamSwitcherAPI.getProxyPath();
```

### getWsEventsPath()

Returns relative path for event websocket

-   **Returns:** `string`

```javascript
const path = CamSwitcherAPI.getWsEventsPath();
```

### getClipPreviewPath(clipId, storage)

Returns relative path for clip preview

-   **Parameters:**
    -   `clipId` (`string`): Id/name of the clip.
    -   `storage` (`'SD_DISK'` | `'FLASH'`): Storage of the clip.
-   **Returns:** `string`

```javascript
const path = CamSwitcherAPI.getClipPreviewPath('clip1', 'FLASH');
```

## Methods - Common

### getClient(proxyParams?)

Returns CamSwitcher client - can be used in custom CamSwitcher API calls.

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
const client = cswApi.getClient();
```

### generateSilence(sampleRate, channels, options?)

Generates silence clip, used when there is no audio. Its mandatory to have silence clip generated to CSw work properly

-   **Parameters:**
    -   `sampleRate` (`number`): Audio sample rate.
    -   `channels`: (`'mono'` | `'stereo'`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.generateSilence(41500, 'mono');
```

### checkCameraTime(options?)

Check if camera has correct time set up (used for checking trial license)

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await cswApi.checkCameraTime();
```

### getStorageInfo(options?)

Gets storage information.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStorageInfo>`

    ```typescript
    type TStorageInfo = {
        storage: 'SD_DISK' | 'FLASH';
        writable: boolean;
        size: number;
        available: number;
    };
    ```

```javascript
const storageInfo = await cswApi.getStorageInfo();
```

### getMaxFps(source, options?)

Gets the maximum FPS for a video source.

-   **Parameters:**
    -   `source` (`number`): Video source index.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<number>`

```javascript
const maxFps = await cswApi.getMaxFps(1);
```

### getNetworkCameraList(options?)

Gets the list of network cameras.

-   **Parameters:**
    -   `source` (`number`): Video source index.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TNetworkCamera[]>`

    ```typescript
    type TNetworkCamera = {
        name: string;
        ip: string;
    };
    ```

```javascript
const cameras = await cswApi.getNetworkCameraList();
```

## Methods - Websockets

### wsAuthorization(options?)

Gets the WebSocket authorization token to authorize event websocket

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const token = await cswApi.wsAuthorization();
```

### getOutputInfo(options?)

Gets parameters to set up video stream websocket.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TOutputInfo>`

    ```typescript
    type TOutputInfo = {
        rtspUrl: string;
        ws: string;
        wsInitialMessage: string;
    };
    ```

```javascript
const outputInfo = await cswApi.getOutputInfo();
```

### getAudioPushInfo(options?)

Gets parameters to set up audio push websocket.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TAudioPushInfo>`

    ```typescript
    type TAudioPushInfo = {
        ws: string;
        wsInitialMessage: string;
    };
    ```

```javascript
const audioPushInfo = await cswApi.getAudioPushInfo();
```

## Methods - Streams

### types

```typescript
type TStreamSave = {
    ip: string;
    enabled: boolean;
    niceName: string;
    mdnsName: string;
    port: number;
    auth: string;
    query: string;
    channel: 'audio' | 'video' | 'av';
    keyboard: Record<string, string | null>;
    viewNumber: number;
    sortIndexOverview: number | undefined;
};

type TStramSaveList = Record<string, TStreamSave>;
type TStreamSaveLoadList = Record<string, Partial<TStreamSave>>;
```

### getStreamSaveList(options?)

Gets the list of saved streams.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStreamSaveLoadList>` ([`TStreamSaveLoadList`](#types))

```javascript
const streams = await cswApi.getStreamSaveList();
```

### setStreamSaveList(data, options?)

Sets the list of saved streams.

-   **Parameters:**
    -   `data` ([`TStreamSaveList`](#types)): Stream data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setStreamSaveList(streamData);
```

## Methods - Clips

### types

```typescript
type TClipSave = {
    niceName: string;
    channel: 'audio' | 'video' | 'av';
    keyboard: Record<string, string | null>;
    sortIndexOverview: number;
};

type TClipSaveList = Record<string, TClipSave>;
type TClipSaveLoadList = Record<string, Partial<TClipSave>>;
```

```typescript
type TClipList = Record<
    string,
    {
        storage: 'SD_DISK' | 'FLASH';
        duration: number;
        stream_list: (
            | {
                  type: 'video';
                  width: number;
                  height: number;
                  fps: number;
                  sample_rate: number;
                  h264_profile: 'high' | 'main' | 'baseline';
                  h264_level: '4.1';
                  gop: number;
                  bitrate: number;
              }
            | {
                  type: 'audio';
                  sample_rate: number;
                  channel_count: 1 | 2;
              }
        )[];
    }
>;
```

```typescript
type TStorageType = 'SD_DISK' | 'FLASH';
```

### getClipSaveList(options?)

Gets the list of saved clips.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TClipSaveLoadList>` ([`TClipSaveLoadList`](#types-1))

```javascript
const clips = await cswApi.getClipSaveList();
```

### setClipSaveList(data, options?)

Sets the list of saved clips.

-   **Parameters:**
    -   `data` ([`TClipSaveList`](#types-1)): Clip data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setClipSaveList(clipData);
```

### addNewClip(file, clipType, storage, clipId, fileName?, options?)

Uploads a new clip (video or audio).

-   **Parameters:**
    -   `file` (`Buffer` | `File`): The clip file data.
    -   `clipType` (`'video'` | `'audio'`): Type of the clip.
    -   `storage` ([`TStorageType`](#types-1)): Storage type, e.g. 'SD_DISK' or 'FLASH'.
    -   `clipId` (`string`): Clip identifier.
    -   `fileName` (`string`, optional): Name of the file.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
const fileBuffer = fs.readFileSync('clip.mp4');
await cswApi.addNewClip(fileBuffer, 'video', 'SD_DISK', 'clip1', 'clip.mp4');
```

### removeClip(clipId, storage, options?)

Removes a clip by ID and storage type.

-   **Parameters:**
    -   `clipId` (string): Clip identifier.
    -   `storage` ([`TStorageType`](#types-1)): Storage type.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.removeClip('clip1', 'SD_DISK');
```

### getClipList(options?)

Gets the list of clips.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TClipList>` ([`TClipList`](#types-1))

```javascript
const clips = await cswApi.getClipList();
```

## Methods - Playlists

### types

```typescript
type TPlaylistSave = {
    niceName: string;
    channel: 'audio' | 'video' | 'av';
    keyboard: Record<string, string | null>;
    isFavourite: boolean;
    play_type: 'PLAY_ALL' | 'PLAY_ALL_LOOP' | 'PLAY_ALL_SHUFFLED' | 'PLAY_ALL_LOOP_SHUFFLED' | 'PLAY_ONE_RANDOM';
    stream_list: {
        repeat: number;
        video: {
            storage?: 'SD_DISK' | 'FLASH' | undefined;
            stream_name?: string | undefined;
            clip_name?: string | undefined;
            tracker_name?: string | undefined;
        };
        id: string;
        isTimeoutCustom: boolean;
        ptz_preset_pos_name: string;
        timeout: number;
        audio:
            | {
                  storage?: 'SD_DISK' | 'FLASH' | undefined;
                  stream_name?: string | undefined;
                  clip_name?: string | undefined;
                  tracker_name?: string | undefined;
              }
            | undefined;
    }[];
    sortIndexOverview: number | undefined;
    sortIndexFavourite: number | undefined;
    default: boolean | undefined;
};

type TPlaylistSaveList = Record<string, TPlaylistSave>;
type TPlaylistSaveLoadList = Record<string, Partial<TPlaylistSave>>;
```

### getPlaylistSaveList(options?)

Gets the list of saved playlists.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TPlaylistSaveLoadList>` ([`TPlaylistSaveLoadList`](#types-2))

```javascript
const playlists = await cswApi.getPlaylistSaveList();
```

### setPlaylistSaveList(data, options?)

Sets the list of saved playlists.

-   **Parameters:**
    -   `data` ([`TPlaylistSaveList`](#types-2)): Playlist data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setPlaylistSaveList(playlistData);
```

### playlistSwitch(playlistName, options?)

Switches to the specified playlist.

-   **Parameters:**
    -   `playlistName` (string): Name of the playlist to switch to.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistSwitch('MyPlaylist');
```

### playlistQueuePush(playlistName, options?)

Adds a playlist to the queue.

-   **Parameters:**
    -   `playlistName` (string): Name of the playlist to add to the queue.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueuePush('MyPlaylist');
```

### playlistQueueClear(options?)

Clears the playlist queue.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueueClear();
```

### playlistQueueList(options?)

Gets the current playlist queue.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string[]>` - Array of playlist names in the queue.

```javascript
const queue = await cswApi.playlistQueueList();
```

### playlistQueuePlayNext(options?)

Plays the next playlist in the queue.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueuePlayNext();
```

## Methods - Trackers

### types

```typescript
type TTrackerSave = {
    channel: 'audio' | 'video' | 'av';
    keyboard: Record<string, string | null>;
    sortIndexOverview: number;
    viewNumber: number;
    id: string;
    name: string;
    previewId: string;
    duration: number;
    width: number;
    height: number;
    fps: number;
    motion_history_frames: number;
    include_zone: number[][];
    include_node_ids: string[];
    camera_list: {
        id: string;
        name: string;
        overview: boolean;
        zone: number[];
        playlist_name: string;
        ptz_preset_pos_no: number;
    }[];
    camera_view_number: number;
};

type TTrackerSaveList = Record<string, TTrackerSave>;
type TrackerSaveLoadList = Record<string, Partial<TTrackerSave>>;
```

### getTrackerSaveList(options?)

Gets the list of saved trackers.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TrackerSaveLoadList>` ([`TrackerSaveLoadList`](#types-3))

```javascript
const trackers = await cswApi.getTrackerSaveList();
```

### setTrackerSaveList(data, options?)

Sets the list of saved trackers.

-   **Parameters:**

    -   `data` ([`TrackerSaveList`](#types-3)): Tracker data.
    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setTrackerSaveList(trackerData);
```

## Methods - Configuration

### types

```typescript
type TCameraOptions = {
    resolution: string;
    h264Profile: 'high' | 'main' | 'baseline';
    fps: number;
    compression: number;
    govLength: number;
    bitrateVapixParams: string | null;
    audioSampleRate: number;
    audioChannelCount: 1 | 2;
    keyboard: {
        fromSource?: Record<string, string | null>;
        none?: Record<string, string | null>;
    };
    bitrateMode: 'VBR' | 'MBR' | 'ABR';
    maximumBitRate: number;
    retentionTime: number;
    bitRateLimit: number;
};
```

```typescript
type TGlobalAudioSettings = {
    type: 'fromSource' | 'source';
    source: string;
    storage?: string;
};
```

```typescript
type TSecondaryAudioSettings = {
    type: 'CLIP' | 'STREAM' | 'NONE';
    streamName?: string;
    clipName?: string;
    storage: 'SD_DISK' | 'FLASH';
    secondaryAudioLevel: number;
    masterAudioLevel: number;
};
```

### setCamSwitchOptions(data, cameraFWVersion, options?)

Sets camera switcher options.

-   **Parameters:**
    -   `data` ([`TCameraOptions`](#types-4)): CamSwitcher settings.
    -   `cameraFWVersion` (string): Camera firmware version.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setCamSwitchOptions(options, '10.0.0');
```

### setGlobalAudioSettings(settings, options?)

Sets global audio settings.

-   **Parameters:**
    -   `settings` ([`TGlobalAudioSettings`](#types-4)): Global audio settings - type, storage, source.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setGlobalAudioSettings(audioSettings);
```

### setSecondaryAudioSettings(settings, options?)

Sets secondary audio settings.

-   **Parameters:**
    -   `settings` ([`TSecondaryAudioSettings`](#types-4)): Secondary audio settings - type, volume, name of source etc.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setSecondaryAudioSettings(secondaryAudioSettings);
```

### setDefaultPlaylist(playlistId, options?)

Sets the default playlist.

-   **Parameters:**
    -   `playlistId` (string): Playlist identifier.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setDefaultPlaylist('playlist123');
```

### setPermanentRtspUrlToken(token, options?)

Sets a permanent RTSP URL token.

-   **Parameters:**
    -   `token` (string): RTSP token string.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setPermanentRtspUrlToken('token123');
```

### getCamSwitchOptions(options?)

Gets camera switcher options.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Partial<TCameraOptions>>` ([`TCameraOptions`](#types-4))

```javascript
const cswOptions = await cswApi.getCamSwitchOptions();
```

### getGlobalAudioSettings(options?)

Gets global audio settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TGlobalAudioSettings>` ([`TGlobalAudioSettings`](#types-4)):

```javascript
const audioSettings = await cswApi.getGlobalAudioSettings();
```

### getSecondaryAudioSettings(options?)

Gets secondary audio settings.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TSecondaryAudioSettings>` ([`TSecondaryAudioSettings`](#types-4))

```javascript
const secondaryAudioSettings = await cswApi.getSecondaryAudioSettings();
```

### getPermanentRtspUrlToken(options?)

Gets the permanent RTSP URL token.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const token = await cswApi.getPermanentRtspUrlToken();
```
