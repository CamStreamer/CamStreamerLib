# CamOverlayDrawingAPI

Module for easy control of the CamOverlay drawing API. For more details on supported drawing functions, see https://camstreamer.com/camoverlay-api1

## Methods

-   **CamOverlayDrawingAPI(options)** - The options parameter contains access to the camera. Values mentioned in the example below are defaults.

    ```javascript
    CamOverlayDrawingAPI({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
        camera?: [0],
        zIndex?: 0
    });
    ```

-   **connect()** - Connect to the CamOverlay WebSocket drawing API. The WebSocket is reconnected in case of a connection error.

    ```javascript
    connect();
    ```

-   **disconnect()** - Close the WebSocket connection.

    ```javascript
    disconnect();
    ```

-   **cairo(command, args...)** - Call a function from the Cairo library. See https://cairographics.org/manual/ and https://support.camstreamer.com/hc/en-us/articles/360010465797-CamOverlay-App-1-x-API-documentation for implemented functions.

    ```javascript
    cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 200, 200); // https://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-image-surface-create
    ```

-   **writeText(cairoContext, text, posX, posY, width, height, align, textFitMethod)** - Write aligned text to the box specified by x, y coordinates, width, and height. Alignment options: A_RIGHT, A_LEFT, A_CENTER.

    TextFitMethod options:

    -   TFM_SCALE - Text size is adjusted to the width and height of the box.
    -   TFM_TRUNCATE - Text size is truncated to the width of the box.
    -   TFM_OVERFLOW - Text overflows the box.

    ```javascript
    writeText('cairo0', 'Hello World', 5, 100, 190, 15, 'A_RIGHT', 'TFM_TRUNCATE');
    ```

-   **uploadImageData(imgBuffer)** - Upload a .jpg or .png image to the CamOverlay application. The function returns the variable name and dimensions of the image.

    ```javascript
    uploadImageData(fs.readFileSync('image.png'));
    ```

-   **uploadFontData(fontBuffer)** - Upload a .ttf font to the CamOverlay application.

    ```javascript
    uploadFontData(fs.readFileSync('font.ttf'));
    ```

-   **showCairoImage(cairoImage, posX, posY)** - Show image in the video stream from the camera. Position is in coordinates -1.0, -1.0 (upper left) / 1.0, 1.0 (bottom right).

    ```javascript
    showCairoImage('surface0', -1.0, -1.0);
    ```

-   **showCairoImageAbsolute(cairoImage, posX, posY, width, height)** - Show image in the video stream from the camera. Position is absolute in pixels, stream resolution is required because it can be called once there is no video stream running yet.

    ```javascript
    showCairoImage('surface0', 100, 100, 1920, 1080);
    ```

-   **removeImage()** - Remove the image from the camera stream.

    ```javascript
    removeImage();
    ```

## Events

-   **open** - WebSocket opened or reopened

-   **msg(msg)** - WebSocket message received

-   **error(err)** - An error occurred

-   **close** - WebSocket closed
