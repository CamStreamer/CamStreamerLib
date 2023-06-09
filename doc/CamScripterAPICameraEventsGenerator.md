# CamScripterAPICameraEventsGenerator

Module for Axis camera events generation.

## Methods

-   **CamScripterAPICameraEventsGenerator(options)** - Options parameter contains access to the camera with CamScripter installed.

    ```javascript
    CamScripterAPICameraEventsGenerator({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        auth: 'root:pass',
    });
    ```

-   **connect()** - Connect to the CamScripter camera events websocket API.

    ```javascript
    connect();
    ```

-   **declareEvent()** - Declare event in the camera. After declaration the event is available in Axis Event Rule engine and other application can subscribe for the event. If the websocket is disconnected all declared events are automatically removed from the camera.

    ```javascript
    declareEvent({
        declaration_id: 'Temper1fSensor',
        stateless: false,
        declaration: [
            {
                namespace: 'tnsaxis',
                key: 'topic0',
                value: 'CameraApplicationPlatform',
                value_type: 'STRING',
            },
            {
                namespace: 'tnsaxis',
                key: 'topic1',
                value: 'CamScripter',
                value_type: 'STRING',
            },
            {
                namespace: 'tnsaxis',
                key: 'topic2',
                value: 'Temper1fSensor',
                value_type: 'STRING',
                value_nice_name: 'CamScripter: Temper1fSensor',
            },
            {
                type: 'DATA',
                namespace: '',
                key: 'condition_active',
                value: false,
                value_type: 'BOOL',
                key_nice_name: 'React on active condition (settings in the script)',
                value_nice_name: 'Condition is active',
            },
        ],
    });
    ```

-   **undeclareEvent()** - Remove the declaration from the camera.

    ```javascript
    undeclareEvent({
        declaration_id: 'Temper1fSensor',
    });
    ```

-   **sendEvent()** - Send event which is delivered to all event receivers.

    ```javascript
    sendEvent({
        declaration_id: 'Temper1fSensor',
        event_data: [
            {
                namespace: '',
                key: 'condition_active',
                value: active,
                value_type: 'BOOL',
            },
        ],
    });
    ```

## Events

-   **open** - API connection opened

-   **close** - API connection closed

-   **error(err)** - API connection error

