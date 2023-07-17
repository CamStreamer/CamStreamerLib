# CamOverlayDrawingAPI

Module for easy control of CamOverlay drawing API. For more details on supported drawing functions see https://camstreamer.com/camoverlay-api1

## Methods

-   **CamOverlayDrawingAPI(options)** - Options parameter contains access to the camera. Values mentioned in example below are default.

    ```javascript
    CamOverlayDrawingAPI({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        auth: '',
        camera?: [0],
        zIndex?: 0
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

## Events

-   **msg(msg)** - WebSocket message received

-   **error(err)** - An error occurs

-   **close** - WebSocket closed
