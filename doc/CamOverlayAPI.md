# CamOverlayAPI

Module for access to CamOverlay HTTP interface.

## Methods

-   **CamOverlayAPI(options)** - Options parameter contains access to the camera and service ID. Values mentioned in example below are default.

    ```javascript
    CamOverlayAPI({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    });
    ```

-   **checkCameraTime()** - Verifies the time of the camera against the time of the camstreamer server.
    Returns false if the times do not match or if the check did not take place.

-   **listImages()** - Returns list of all images uploaded on the camera.

-   **uploadImage(file, fileName)** - Uploads new image to the camera.

-   **getNetworkCameraList()** - Returns list of all cameras available on the network.

### CamOverlay services

-   **updateInfoticker(serviceID, text)** - Updates text in Infoticker service, if any is running.

-   **setEnabled(serviceID, enabled)** - Enables/disables the bound CO service.

-   **isEnabled(serviceID)** - Returns whether the bound CO service is enabled (true) or disabled (false).

-   **getSingleService(serviceId)** - Returns complete settings of the given CamOverlay service.

-   **getServices()** - Returns complete settings of all CamOverlay services.

-   **updateSingleService(serviceId, serviceJson)** - Changes settings of the given CamOverlay service.

-   **updateServices(servicesJson)** - Changes settings of all CamOverlay services.

### Custom Graphics

-   **updateCGText(serviceID, fields)** - Updates text fields listed in parameter fields.

    One field is defined as follows. Parameter "color" is optional.

        ```json
        {
            "field_name": "NAME_OF_YOUR_FIELD",
            "text": "UPDATED_TEXT",
            "color": "COLOR"
        }
        ```

-   **updateCGImagePos(serviceID, coordinates, x, y)** - Changes position of Custom Graphics.

    Coordinates values: `"top_left"`, `"top_right"`, `"bottom_left"`, `"bottom_right"`, `"left"`, `"right"` , `"top"`, `"bottom"`, `"center"`

-   **updateCGImage(serviceID, path, [coordinates, x, y])** - Updates Custom Graphics background to an image with specified path on the camera.
    If no coordinates are specified, the service will use positioning from the last update.

-   **updateCGImageFromData(serviceID, imageType, imageData, [coordinates, x, y])** - Updates Custom Graphics background to an image passed as
    the imageData argument. If no coordinates are specified, the service will use positioning from the last update.
