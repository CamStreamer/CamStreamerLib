# CameraVapix

Access to Axis camera VAPIX interface. For more details see documentation for [Axis camera VAPIX library](https://www.axis.com/vapix-library/).

## Methods

-   **CameraVapix(options)** - Options parameter contains access to the camera and specifies which protocol should be used. Values mentioned
    in example below are default.

        ```javascript
        CameraVapix({
            tls: false,
            tlsInsecure: false,
            protocol: 'http',
            ip: '127.0.0.1',
            port: 80,
        });
        ```

-   **vapixGet(groupNames)** - Universal method for HTTP GET requests to camera VAPIX API.

    ```javascript
    vapixGet('/axis-cgi/param.cgi?action=list&group=camscripter');
    ```

-   **vapixPost(groupNames)** - Universal method for HTTP POST requests to camera VAPIX API.

    ```javascript
    vapixPost('/axis-cgi/param.cgi', 'action=update&camscripter.enabled=1');
    ```

-   **getParameterGroup(groupNames)** - Get parameters from the camera.

    ```javascript
    getParameterGroup('camscripter,camoverlay');
    ```

-   **setParameter(params)** - Set parameters to the camera.

    ```javascript
    setParameter({ 'root.camscripter.Enabled': '1' });
    ```

-   **getPTZPresetList(channel)** - Get a list of PTZ presets for the specified channel. Channels are numbered from 1.

    ```javascript
    getPTZPresetList(1);
    ```

-   **goToPreset(channel, presetName)** - Move the camera channel to the PTZ preset.

    ```javascript
    goToPreset(1, 'home');
    ```

-   **getGuardTourList()** - Get the list of guard tours.

    ```javascript
    getGuardTourList();
    ```

-   **setGuardTourEnabled(gourTourID, enable)** - Enable or disable the guard tour.

    ```javascript
    setGuardTourEnabled('root.GuardTour.G0', true);
    ```

-   **getInputState(port)** - Get the camera input state for the specified port number.

    ```javascript
    getInputState(2);
    ```

-   **setOutputState(port, active)** - Set the state of the camera output port.

    ```javascript
    setOutputState(2, true);
    ```

-   **getApplicationList()** - Get the list of installed Acap applications.

    ```javascript
    getApplicationList();
    ```

-   **getEventDeclarations()** - Get all the available camera events in JSON format.

    ```javascript
    getEventDeclarations();
    ```

-   **getCameraImage(camera, compression, resolution, outputStream)**

    -   Get image of the camera using specified compression and resolution, write it in stream given as the outputStream argument.

    **eventsConnect()** - Start reading all subscribed events from VAPIX library.

    ```javascript
    eventsConnect();
    ```

    **eventsDisconnect()** - End reading all subscribed events.

    ```javascript
    eventsDisconnect();
    ```

## Events

-   **eventsConnect** - Websocket connection is ready

-   **eventsDisconnect(err)** - Websocket connection error

-   **websocketDisconnect** - Websocket connection closed

-   **\*** - You can listen for events from camera by registrating the appropriate topic

    ```javascript
    on('axis:CameraApplicationPlatform/VMD/Camera1Profile1/.', function (event) {});
    ```
