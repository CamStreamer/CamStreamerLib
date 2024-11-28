# VapixEvents

Module for receiving Axis camera events.

## Methods

-   **VapixEvents(options)** - The options parameter contains access details for the Axis camera.
    Values mentioned in the example below are default.

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

-   **connect()** - Connect to the VAPIX WebSocket API. The WebSocket is reconnected in case of a connection error.

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

-   **${topic}(eventDataJSON)** - Event received from the AXIS camera
