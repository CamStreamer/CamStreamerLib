# CamOverlayDrawingAPI

Three modules for even easier control of CamOverlay drawing API.

## ResourceManager

-   Downloads and stores resources.

-   **registerImage(moniker: string, fileName: string), registerFont(moniker: string, fileName: string)** - Adds the resource specified by `fileName` to this `ResourceManager`.

-   **async image(co: CamOverlayDrawingAPI, moniker: string): TUploadImageResponse** - Uploads the image specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the imasge and its resolution.

    ```typescript
    type TUploadImageResponse = {
        var: string;
        width: number;
        height: number;
        call_id: number;
    };
    ```

-   **async font(co: CamOverlayDrawingAPI, moniker: string): TCairoCreateResponse** - Uploads the font specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the font.

    ```typescript
    type TCairoCreateResponse = {
        var: string;
        call_id: number;
    };
    ```

-   **clear()** - Removes all data from ResourceManager. Call this function when the connection to CamOverlay is closed.

## Frame

-   **Frame(options: FrameOptions, rm: ResourceManager, customDraw?: DrawingCallback)**

    ```javascript
    type FrameOptions = {
        x: number,
        y: number,
        width: number,
        height: number,

        enabled?: boolean, // default: true
        bgImage?: string, // default: undefined
        text?: string, // default: ''
        fontColor?: RGB, // default: [1.0, 1.0, 1.0]
        bgColor?: RGBA, // default: undefined
        bgType?: ObjectFitType, // dafault: undefined
    };
    ```

    ```javascript
    type DrawingCallback = (cod: CamOverlayDrawingAPI, cairo: string) => Promise<unknown>;
    ```

-   **setFramePosition(x: number, y: number)** - Sets this frame position to [x,y] relative to the upper left edge of the parent frame.

-   **setFrameSize(width: number, height: number)** - Sets the width and height of this frame.

-   **setText(text: string, align: Align, textType: TMF = 'TFM_OVERFLOW', color?: RGB)** - Sets which text will be displayed in this frame, its aligment, how to solve the situation when the text does not fit into the frame and optionally new color of the text.

    ```javascript
    type Align = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
    type TMF = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
    ```

-   **setFont(fontName: string)** - As a fontName use the moniker registered in ResourceManager.

-   **setBGColor(color: RGBA)** - Sets colour displayed on the frame background.

-   **setBgImage(imageName: string, type: ObjectFitType)** - As an imageName use the moniker registered in ResourceManager.

    ```javascript
    type ObjectFitType = 'fill' | 'fit' | 'none';
    ```

    > fill: The image will be stretched to cover the entire frame area.
    > fit: The image will be stretched to fit at least one side of the frame. The aspect ratio will be preserved.
    > none: The image will be displayed as is.

-   **clear()** - Resets frame to its default state.

-   **insert(...frames: Frame[])**

-   **enable()** - Allows this frame and its children to display.

-   **disable()** - Disallows this frame and its children to display.

## Painter

-   **constructor(opt: PainterOptions, coopt: CamOverlayDrawingOptions, rm: ResourceManager)**

    ```javascript
    type PainterOptions = FrameOptions & {
        screenWidth: number,
        screenHeight: number,
        coAlignment: string,
    };
    ```

-   **async connect()** - Opens CamOverlayDrawingAPI.

-   **disconnect()** - Closes CamOverlayDrawingAPI.

-   **setScreenSize(width: number, height: number)** - Sets the size of the screen to draw on. The resolution of the screen is expected.

-   **setCoAlignment(alignment: string)** - Sets the aligment of this painter. Allowed values:

    > top_left, center_left,bottom_left
    > top_center,center,bottom_center
    > top_right,center_right,bottom_right

-   **async display(scale = 1)** - Renders this painter, including all inserted frames.

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

-   **removeImage()** - Remove image from the camera stream.

    ```javascript
    removeImage();
    ```
