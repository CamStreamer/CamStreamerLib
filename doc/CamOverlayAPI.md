# CamOverlayAPI

Module for easy control of CamOverlay drawing API. For more details on supported drawing functions see https://camstreamer.com/camoverlay-api1

## Methods

-   **CamOverlayAPI(options)** - Options parameter contains access to the camera, service name, service ID and camera. If service ID is not specified, service is automatically created/selected based on serviceName. Specify video channel using parameter camera (in which View Area overlay will be shown). If you need to specify multiple video channels, you can use an array: `camera=[0,1]`. If omitted the default value `camera=0` is used.

    ```javascript
    CamOverlayAPI({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        auth: 'root:pass',
        serviceName: 'Drawing Test',
        serviceID: -1,
        camera: 0,
    });
    ```

-   **connect()** - Connect to CamOverlay WebSocket drawing API.

    ```javascript
    connect();
    ```

-   **cairo(command, args...)** - Call a function from Cairo library. See https://cairographics.org/manual/

    ```javascript
    cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 200, 200); // https://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-image-surface-create
    ```

-   **writeText(cairoContext, text, posX, posY, width, height, align, textFitMethod)** - Write aligned text to the box specified by x, y coordinates, width and height. Alignment options: A_RIGHT, A_LEFT, A_CENTER.

    TextFitMethod options:

    -   TFM_SCALE - Text size is adjusted to width and height of the box.
    -   TFM_TRUNCATE - Text size truncated to the width of the box.
    -   TFM_OVERFLOW - Text overflows the box.

    ```javascript
    writeText('cairo0', 'Hello World', 5, 100, 190, 15, 'A_RIGHT', 'TFM_TRUNCATE');
    ```

-   **uploadImageData(imgBuffer)** -Upload .jpg or .png image to the CamOverlay application. Function returns variable name and dimensions of the image.

    ```javascript
    uploadImageData(fs.readFileSync('image.png'));
    ```

-   **uploadFontData(fontBuffer)** - Upload .ttf font to the CamOverlay application.

    ```javascript
    uploadFontData(fs.readFileSync('font.ttf'));
    ```

-   **showCairoImage(cairoImage, posX, posY)** - Show image in video stream from the camera. Position is in coordinates -1.0, -1.0 (upper left) / 1.0, 1.0 (bootom right).

    ```javascript
    showCairoImage('surface0', -1.0, -1.0);
    ```

-   **showCairoImageAbsolute(cairoImage, posX, posY, width, height)** - Show image in video stream from the camera. Position is absolute in pixels, stream resolution is required, because it can be called once there is no video stream running yet.

    ```javascript
    showCairoImage('surface0', 100, 100, 1920, 1080);
    ```

-   **removeImage()** - Remove image from the camera stream.

    ```javascript
    removeImage();
    ```

-   **updateCGText(fields)** - Updates text fields listed in parameter fields.

    One field is defined as follows. Parameter "color" is optional.

        ```json
        {
            "field_name": "NAME_OF_YOUR_FIELD",
            "text": "UPDATED_TEXT",
            "color": "COLOR"
        }
        ```

-   **updateCGImagePos(coordinates, x, y)** - Changes position of Custom Graphics.

    Coordinates values: `"top_left"`, `"top_right"`, `"bottom_left"`, `"bottom_right"`, `"left"`, `"right"` , `"top"`, `"bottom"`, `"center"`

-   **updateCGImage(path, [coordinates, x, y])** - Updates Custom Graphics background to an image with specified path on the camera.
    If no coordinates are specified, the service will use positioning from the last update.

-   **updateInfoticker(text)** - Updates text in Infoticker service, if any is running.

-   **setEnabled(enabled)** - Enables/disables the bound CO service.

-   **isEnabled()** - Returns whether the bound CO service is enabled (true) or disabled (false).

## Events

-   **msg(msg)** - WebSocket message received

-   **error(err)** - An error occurs

-   **close** - WebSocket closed
