# CamSwitcherAPI

Module for access to the CamOverlay HTTP interface.

## Methods

-   **CamSwitcherAPI(options)** - The options parameter contains access to the camera and service ID. Values mentioned in the example below are default.

    ```javascript
    CamSwitcherAPI({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    });
    ```

### General

-   **generateSilence(sampleRate, channels)** - Generate audio silence according to given parameters.

-   **checkCameraTime()** - Verifies the time of the camera against the time of the CamStreamer server.
    Returns false if the times do not match or if the check did not take place.

-   **listImages()** - Returns a list of all images uploaded to the camera.

-   **getIpListFromNetworkCheck()** - Returns a list of all cameras available on the network.

-   **getMaxFps(source)** - Get maximum available frame rate of given video source.

-   **getStorageInfo()** - Get available storage information.

### Playlists

Manage playlists:

-   **getPlaylistList()** - Returns a list of all playlists available on camera.

-   **playlistQueueList()** - Returns list of the playlist names in the queue.

-   **playlistSwitch(playlistName)** - Switch playlist immediately. Same as
    sequence: `playlistQueueClear()`, `playlistQueuePush(playlistName)`, `playlistQueuePlayNext()`

-   **playlistQueuePush(playlistName)** - Push playlist to the queue.

-   **playlistQueueClear()** - Clear the playlist queue.

-   **playlistQueuePlayNext()** - Play the next playlist from the queue.

### Clips

Manage clips:

-   **getClipList()** - Returns list of the uploaded clips to the camera.

-   **addNewClip(file, clipType, storage, id, fileName)** - Adds new audio/video clip.

-   **removeClip(id, storage)** - Removes clip from camera.

-   **getClipPreview(id, storage)** - Returns video clip preview image.

### Other sources

-   **getStreamList()** - Returns list of streams available on the camera.

-   **getTrackerList()** - Returns list of trackers available on the camera.
