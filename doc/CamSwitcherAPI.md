# CamSwitcherAPI

Module for access to the CamSwitcher HTTP interface.

## Constructor

-   **new CamSwitcherAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/esm/node';
import { CamSwitcherAPI } from 'camstreamerlib/esm';

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

## Static

### getProxyUrlPath()

-   **Returns:** `string`
    returns relative path to proxy.cgi

```javascript
const url = CamSwitcherAPI.getProxyUrlPath();
```

### getWsEventsUrlPath()

-   **Returns:** `string`
    returns relative path for event websocket

```javascript
const url = CamSwitcherAPI.getWsEventsUrlPath();
```

### getClipPreviewUrlPath()

-   **Returns:** `string`
    returns relative path for clip preview

```javascript
const url = CamSwitcherAPI.getClipPreviewUrlPath();
```

## Methods common

### generateSilence(sampleRate, channels)

Generates silence clip, used when there is no audio. Its mandatory to have silence clip generated to CSw work properly

-   **Parameters:**
    -   `sampleRate` (number): audio sample rate
    -   `channels`: ("mono" | "stereo")
-   **Returns:** `Promise<void>`

```javascript
await cswApi.generateSilence(41500, 'mono');
```

### checkCameraTime()

Check if camera has correct time setted up (used for checking trial license)

-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await cswApi.checkCameraTime();
```

### getStorageInfo()

Gets storage information.

-   **Returns:**
    ```
    Promise<Array<{
        storage: "SD_DISK" | "FLASH";
        writable: boolean;
        size: number;
        available: number;
    }>>
    ```

```javascript
const storageInfo = await cswApi.getStorageInfo();
```

### getMaxFps(source)

Gets the maximum FPS for a video source.

-   **Parameters:**
    -   `source` (number): Video source index.
-   **Returns:** `Promise<number>`

```javascript
const maxFps = await cswApi.getMaxFps(1);
```

### getIpListFromNetworkCheck()

Gets the list of network cameras.

-   **Returns:**
    ```
    Promise<Array<{
        name: string;
        ip: string;
    }>>
    ```

```javascript
const cameras = await cswApi.getIpListFromNetworkCheck();
```

## Methods websockets

### wsAuthorization()

Gets the WebSocket authorization token to authorize event websocket

-   **Returns:** `Promise<string>`

```javascript
const token = await cswApi.wsAuthorization();
```

### getOutputInfo()

Gets parameters to set up video stream websocket.

-   **Returns:**
    ```
    Promise<{
        rtsp_url: string;
        ws: string;
        ws_initial_message: string;
    }>
    ```

```javascript
const outputInfo = await cswApi.getOutputInfo();
```

### getAudioPushInfo()

Gets parameters to set up audio push websocket.

-   **Returns:**
    ```
    Promise<{
        ws: string;
        ws_initial_message: string;
    }>
    ```

```javascript
const audioPushInfo = await cswApi.getAudioPushInfo();
```

## Methods sources

### getStreamSaveList()

Gets the list of saved streams.

-   **Returns:**
    ```
    Promise<{
        [streamId: string]: {
            niceName?: string;
            ip?: string;
            mdnsName?: string;
            port?: number;
            enabled?: boolean;
            auth?: string;
            query?: string;
            channel?: 'audio' | 'video' | 'av';
            keyboard?: object;
            sortIndexOverview?: number;
            viewNumber?: number;
        }
    }>
    ```

```javascript
const streams = await cswApi.getStreamSaveList();
```

### getClipSaveList()

Gets the list of saved clips.

-   **Returns:**
    ```
    Promise<{
        [clipId: string]: {
            niceName?: string;
            channel?: 'audio' | 'video' | 'av';
            keyboard?: object;
            sortIndexOverview?: number;
        }
    }>
    ```

```javascript
const clips = await cswApi.getClipSaveList();
```

### getPlaylistSaveList()

Gets the list of saved playlists.

-   **Returns:**
    ```
    Promise<{
        [playlistId: string]: {
            channel: 'audio' | 'video' | 'av';
            isFavourite: boolean;
            keyboard: object;
            niceName: string;
            sortIndexFavourite?: number;
            sortIndexOverview?: number;
            play_type: 'PLAY_ALL' | 'PLAY_ALL_LOOP' | 'PLAY_ALL_SHUFFLED' | 'PLAY_ALL_LOOP_SHUFFLED' | 'PLAY_ONE_RANDOM';
            default?: boolean;
            stream_list: Array<{
                id: string;
                isTimeoutCustom: boolean;
                ptz_preset_pos_name: string;
                repeat: number;
                timeout: number;
                video: {
                    stream_name?: string;
                    clip_name?: string;
                    tracker_name?: string;
                    storage?: 'SD_DISK' | 'FLASH',
                };
                audio?: {
                    stream_name?: string;
                    clip_name?: string;
                    tracker_name?: string;
                    storage?: 'SD_DISK' | 'FLASH',
                };
            }>;
        }
    }>
    ```

```javascript
const playlists = await cswApi.getPlaylistSaveList();
```

### getTrackerSaveList()

Gets the list of saved trackers.

-   **Returns:**
    ```
    Promise<{
        [trackerId: string]: {
            id?: string;
            name?: string;
            previewId?: string;
            duration?: number;
            keyboard?: object;
            channel?: 'audio' | 'video' | 'av';
            sortIndexOverview?: number;
            width?: number;
            height?: number;
            fps?: number;
            motion_history_frames?: number;
            include_zone?: number[][];
            include_node_ids?: string[];
            camera_list?: Array<{
                id?: string;
                name?: string;
                overview?: boolean;
                zone?: number[];
                playlist_name?: string;
                ptz_preset_pos_no?: number;
            }>;
            viewNumber?: number;
            camera_view_number?: number;
        }
    }>
    ```

```javascript
const trackers = await cswApi.getTrackerSaveList();
```

### setStreamSaveList(data)

Sets the list of saved streams.

-   **Parameters:**
    -   `data` (object):
        ```
        { [streamId: string]: {
            niceName: string;
            ip: string;
            mdnsName: string;
            port: number;
            enabled: boolean;
            auth: string;
            query: string;
            channel: 'audio' | 'video' | 'av';
            keyboard: object;
            sortIndexOverview?: number;
            viewNumber: number
        } }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setStreamSaveList(streamData);
```

### setClipSaveList(data)

Sets the list of saved clips.

-   **Parameters:**
    -   `data` (object):
        ```
        { [clipId: string]: {
            niceName: string;
            channel: 'audio' | 'video' | 'av';
            keyboard: object;
            sortIndexOverview: number;
        } }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setClipSaveList(clipData);
```

### setPlaylistSaveList(data)

Sets the list of saved playlists.

-   **Parameters:**
    -   `data` (object):
        ```
        { [playlistId: string]: {
            channel: 'audio' | 'video' | 'av';
            isFavourite: boolean;
            keyboard: object;
            niceName: string;
            sortIndexFavourite?: number;
            sortIndexOverview?: number;
            play_type: 'PLAY_ALL' | 'PLAY_ALL_LOOP' | 'PLAY_ALL_SHUFFLED' | 'PLAY_ALL_LOOP_SHUFFLED' | 'PLAY_ONE_RANDOM';
            default?: boolean;
            stream_list: Array<{
                id: string;
                isTimeoutCustom: boolean;
                ptz_preset_pos_name: string;
                repeat: number;
                timeout: number;
                video: {
                    stream_name?: string;
                    clip_name?: string;
                    tracker_name?: string;
                    storage?: 'SD_DISK' | 'FLASH',
                };
                audio?: {
                    stream_name?: string;
                    clip_name?: string;
                    tracker_name?: string;
                    storage?: 'SD_DISK' | 'FLASH',
                };
            }>;
        } }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setPlaylistSaveList(playlistData);
```

### setTrackerSaveList(data)

Sets the list of saved trackers.

-   **Parameters:**
    -   `data` (object):
        ```
        { [trackerId: string]: {
            id: string;
            name: string;
            previewId: string;
            duration: number;
            keyboard: object;
            channel: 'audio' | 'video' | 'av';
            sortIndexOverview: number;
            width: number;
            height: number;
            fps: number;
            motion_history_frames: number;
            include_zone: number[][];
            include_node_ids: string[];
            camera_list: Array<{
                id: string;
                name: string;
                overview: boolean;
                zone: number[];
                playlist_name: string;
                ptz_preset_pos_no: number;
            }>;
            viewNumber: number;
            camera_view_number: number;
        } }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setTrackerSaveList(trackerData);
```

## Methods playlists

### playlistSwitch(playlistName)

Switches to the specified playlist.

-   **Parameters:**
    -   `playlistName` (string): Name of the playlist to switch to.
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistSwitch('MyPlaylist');
```

### playlistQueuePush(playlistName)

Adds a playlist to the queue.

-   **Parameters:**
    -   `playlistName` (string): Name of the playlist to add to the queue.
-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueuePush('MyPlaylist');
```

### playlistQueueClear()

Clears the playlist queue.

-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueueClear();
```

### playlistQueueList()

Gets the current playlist queue.

-   **Returns:** `Promise<string[]>` - Array of playlist names in the queue.

```javascript
const queue = await cswApi.playlistQueueList();
```

### playlistQueuePlayNext()

Plays the next playlist in the queue.

-   **Returns:** `Promise<void>`

```javascript
await cswApi.playlistQueuePlayNext();
```

## Methods clips

### addNewClip(file, clipType, storage, id, fileName?)

Uploads a new clip (video or audio).

-   **Parameters:**
    -   `file` (Buffer | File): The clip file data.
    -   `clipType` ('video' | 'audio'): Type of the clip.
    -   `storage` (string): Storage type, e.g. 'SD_DISK' or 'FLASH'.
    -   `id` (string): Clip identifier.
    -   `fileName` (string, optional): Name of the file.
-   **Returns:** `Promise<void>`

```javascript
const fileBuffer = fs.readFileSync('clip.mp4');
await cswApi.addNewClip(fileBuffer, 'video', 'SD_DISK', 'clipId', 'clip.mp4');
```

### removeClip(id, storage)

Removes a clip by ID and storage type.

-   **Parameters:**
    -   `id` (string): Clip identifier.
    -   `storage` (string): Storage type.
-   **Returns:** `Promise<void>`

```javascript
await cswApi.removeClip('clipId', 'SD_DISK');
```

### getClipList()

Gets the list of clips.

-   **Returns:**
    ```
    Promise<{
        [clipId: string]: {
            storage: string;
            duration: number;
            stream_list: Array<{
                type: 'video';
                width: number;
                height: number;
                sample_rate: number;
                h264_profile: string;
                h264_level: '4.1';
                gop: number;
                fps: number;
                bitrate: number
            } | {
                type: 'audio';
                sample_rate: number;
                channel_count: number
            } >;
        }
    }>
    ```

```javascript
const clips = await cswApi.getClipList();
```

## Methods configuration

### setCamSwitchOptions(data, cameraFWVersion)

Sets camera switcher options.

-   **Parameters:**
    -   `data` (object):
        ```
        {
            resolution: string;
            h264Profile: string;
            fps: number;
            compression: number;
            govLength: number;
            bitrateVapixParams: string | null;
            audioSampleRate: number;
            audioChannelCount: number;
            keyboard: object;
            bitrateMode: 'VBR' | 'MBR' | 'ABR';
            maximumBitRate: number;
            retentionTime: number;
            bitRateLimit: number;
        }
        ```
    -   `cameraFWVersion` (string): Camera firmware version.
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setCamSwitchOptions(options, '10.0.0');
```

### setGlobalAudioSettings(settings)

Sets global audio settings.

-   **Parameters:**
    -   `settings` (object):
        ```
        {
            type: 'fromSource' | 'source';
            source: string;
            storage?: string;
        }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setGlobalAudioSettings(audioSettings);
```

### setSecondaryAudioSettings(settings)

Sets secondary audio settings.

-   **Parameters:**
    -   `settings` (object):
        ```
        {
            type: 'CLIP' | 'STREAM' | 'NONE';
            streamName?: string;
            clipName?: string;
            storage: 'FLASH' | 'SD_DISK';
            secondaryAudioLevel: number;
            masterAudioLevel: number;
        }
        ```
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setSecondaryAudioSettings(secondaryAudioSettings);
```

### setDefaultPlaylist(id)

Sets the default playlist.

-   **Parameters:**
    -   `id` (string): Playlist identifier.
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setDefaultPlaylist('playlistId');
```

### setPermanentRtspUrlToken(token)

Sets a permanent RTSP URL token.

-   **Parameters:**
    -   `token` (string): RTSP token string.
-   **Returns:** `Promise<boolean>`

```javascript
await cswApi.setPermanentRtspUrlToken('token123');
```

### getCamSwitchOptions()

Gets camera switcher options.

-   **Returns:**
    ```
    Promise<{
        resolution?: string;
        h264Profile?: string;
        fps?: number;
        compression?: number;
        govLength?: number;
        bitrateVapixParams?: string | null;
        audioSampleRate?: number;
        audioChannelCount?: number;
        keyboard?: object;
        bitrateMode?: 'VBR' | 'MBR' | 'ABR';
        maximumBitRate?: number;
        retentionTime?: number;
        bitRateLimit?: number;
    }>
    ```

```javascript
const options = await cswApi.getCamSwitchOptions();
```

### getGlobalAudioSettings()

Gets global audio settings.

-   **Returns:**
    ```
    Promise<{
        type: 'fromSource' | 'source';
        source: string;
        storage?: string;
    }>
    ```

```javascript
const audioSettings = await cswApi.getGlobalAudioSettings();
```

### getSecondaryAudioSettings()

Gets secondary audio settings.

-   **Returns:**
    ```
    Promise<{
        type: 'CLIP' | 'STREAM' | 'NONE';
        streamName?: string;
        clipName?: string;
        storage: 'FLASH' | 'SD_DISK';
        secondaryAudioLevel: number;
        masterAudioLevel: number;
    }>
    ```

```javascript
const secondaryAudioSettings = await cswApi.getSecondaryAudioSettings();
```

### getPermanentRtspUrlToken()

Gets the permanent RTSP URL token.

-   **Returns:** `Promise<string>`

```javascript
const token = await cswApi.getPermanentRtspUrlToken();
```
