# CamStreamerAPI

Module for easy control of streaming in the CamStreamer Acap application.

## Methods

-   **CamStreamerAPI(options)** - The options parameter contains access to the camera and specifies which protocol should be used. Values mentioned
    in the example below are default.

        ```javascript
        CamStreamerAPI({
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            user: '',
            pass: '',
        });
        ```

-   **getStreamList()** - Get info about CamStreamer streams in JSON format.

    ```javascript
    getStreamList();
    ```

-   **getStream(streamID)** - Get info about the CamStreamer stream specified by `streamID`.

-   **getStreamParameter(streamID, paramName)** - Get a single parameter of the stream with the specified ID.

    ```javascript
    getStreamParameter('1234', 'enabled');
    ```

-   **setStream(streamID, params)** - Set info about the CamStreamer stream specified by `streamID`.

-   **setStreamParameter(streamID, paramName, value)** - Set the value of the stream parameter.

    ```javascript
    setStreamParameter('1234', 'enabled', '1');
    ```

-   **isStreaming(streamID)** - Return the state of streaming.

    ```javascript
    isStreaming('1234');
    ```

-   **deleteStream(streamID)** - Delete the CamStreamer stream specified by `streamID`.
