# CamSwitcherEvents

Module for CamSwitcher events receiving.

## Methods

-   **CamSwitcherEvents(options)** - Options parameter contains access to the camera with CamSwitcher installed.
    Values mentioned in example below are default.

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

-   **connect()** - Connect to the CamSwitcher events websocket API. The Websocket is reconnected in case of connection error.

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

-   **event(eventDataJSON)** - event received from the CamSwitcher
