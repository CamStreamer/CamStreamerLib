# CamSwitcherEvents

Module for receiving CamSwitcher events.

## Methods

-   **CamSwitcherEvents(options)** - The options parameter contains access to the camera with CamSwitcher installed.
    Values mentioned in the example below are default.

        ```javascript
        CamSwitcherEvents({
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            user: '',
            pass: '',
        });
        ```

-   **connect()** - Connect to the CamSwitcher events WebSocket API. The WebSocket is reconnected in case of a connection error.

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

-   **event(eventDataJSON)** - Event received from the CamSwitcher
