# CameraVapix

Access to Axis camera VAPIX interface. For more details see documentation for [Axis camera VAPIX library](https://www.axis.com/vapix-library/).

## Methods

-   **CameraVapix(options)** - Options parameter contains access to the camera and specifies which protocol should be used. Values mentioned
    in example below are default.

        ```javascript
        CameraVapix({
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            user: '',
            pass: '',
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

-   **getCameraImage(camera, compression, resolution, outputStream)** - Get image of the camera using specified compression and resolution, write it in stream given as the outputStream argument.

-   **getEventDeclarations()** - Get all the available camera events in JSON format.

-   **getSupportedAudioSampleRate()** - Return all supported audio sample rates.

-   **checkSdCard()** - Return info about camera's SD card.

-   **downloadCameraReport()** - Generate and return a server report including product information, parameter settings and system logs.

-   **getMaxFps(channel)** - Return the maximum supported FPS on the given channel.

-   **getTimezone()** - Return timezone of the camera.

-   **getHeaders()** - Read all custom HTTP headers from the camera.

-   **setHeaders()** - Add custom HTTP headers to the camera.

### param.cgi

-   **getParameterGroup(groupNames)** - Get parameters from the camera.

    ```javascript
    getParameterGroup('camscripter,camoverlay');
    ```

-   **setParameter(params)** - Set parameters to the camera.

    ```javascript
    setParameter({ 'root.camscripter.Enabled': '1' });
    ```

-   **getGuardTourList()** - Get the list of guard tours.

    ```javascript
    getGuardTourList();
    ```

-   **setGuardTourEnabled(gourTourID, enable)** - Enable or disable the guard tour.

    ```javascript
    setGuardTourEnabled('root.GuardTour.G0', true);
    ```

### ptz.cgi

-   **getPTZPresetList(channel)** - Get a list of PTZ presets for the specified channel. Channels are numbered from 1.

    ```javascript
    getPTZPresetList(1);
    ```

-   **listPtzVideoSourceOverview()** - Return current preset positions for all video channels.

-   **goToPreset(channel, presetName)** - Move the camera channel to the PTZ preset.

    ```javascript
    goToPreset(1, 'home');
    ```

-   **getPtzPosition(camera)** - Return values of pan, tilt and zoom for current position.

### port.cgi

-   **getInputState(port)** - Get the camera input state for the specified port number.

    ```javascript
    getInputState(2);
    ```

-   **setOutputState(port, active)** - Set the state of the camera output port.

    ```javascript
    setOutputState(2, true);
    ```

### application API

-   **getApplicationList()** - Get the list of installed Acap applications.

-   **startApplication(applicationID)** - Start the application whose name is given by the parameter `applicationID`.

-   **restartApplication(applicationID)** - Restart the application whose name is given by the parameter `applicationID`.

-   **stopApplication(applicationID)** - Stop the application whose name is given by the parameter `applicationID`.
