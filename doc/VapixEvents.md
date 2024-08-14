# VapixEvents

Module for Axis camera events receiving.

## Methods

-   **VapixEvents(options)** - Options parameter contains access to the Axis camera.
    Values mentioned in example below are default.

        ```javascript
        VapixEvents({
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            user: '',
            pass: '',
        });
        ```

-   **connect()** - Connect to the VAPIX websocket API. The Websocket is reconnected in case of connection error.

    ```javascript
    connect();
    ```

-   **disconnect()** - Close the WebSocket connection.

    ```javascript
    disconnect();
    ```

## Events

-   **open** - API connection opened

-   **close** - API connection closed

-   **error(err)** - API connection error

-   **${topic}(eventDataJSON)** - event received from the AXIS camera
