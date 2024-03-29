# CamStreamerAPI

Module for easy control of streaming in CamStreamer Acap application.

## Methods

-   **CamStreamerAPI(options)** - Options parameter contains access to the camera and specifies which protocol should be used. Values mentioned
    in example below are default.

        ```javascript
        CamStreamerAPI({
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            auth: '',
        });
        ```

-   **getStreamList()** - Get info about CamStreamer streams in JSON format.

    ```javascript
    getStreamList();
    ```

-   **getStreamParameter(streamID, paramName)** - Get a single parameter of the stream with specified ID.

    ```javascript
    getStreamParameter('1234', 'enabled');
    ```

-   **setStreamParameter(streamID, paramName, value)** - Set value of stream parameter.

    ```javascript
    setStreamParameter('1234', 'enabled', '1');
    ```

-   **isStreaming(streamID)** - Return the state of streaming.

    ```javascript
    isStreaming('1234');
    ```
