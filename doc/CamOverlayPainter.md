# CamOverlayPainter

Three modules for even easier control of the CamOverlay drawing API.

## ResourceManager

-   Downloads and stores resources.

-   **registerImage(moniker: string, fileName: string)** - Adds the image specified by `fileName` to this `ResourceManager`.

-   **registerFont(moniker: string, fileName: string)** - Adds the font specified by `fileName` to this `ResourceManager`.

-   **async image(moniker: string): TUploadImageResponse** - Uploads the image specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the image and its resolution.

    ```typescript
    type TUploadImageResponse = {
        var: string;
        width: number;
        height: number;
        call_id: number;
    };
    ```

-   **async font(moniker: string): TCairoCreateResponse** - Uploads the font specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the font.

    ```typescript
    type TCairoCreateResponse = {
        var: string;
        call_id: number;
    };
    ```

-   **clear()** - Removes all data from ResourceManager. Call this function when the connection to CamOverlay is closed.

## Painter

-   Represents one widget, manages the connection to CamOverlay, and the display of graphics as a whole.

-   **Layers Usage** - Layers are used to optimize drawing speed. It is possible to render the most dynamic frames to the top layer and update only this layer during the rendering process. If the layers are used, the painter caches the result of each layer to be able to partly refresh the image. It is also mandatory to use the `invalidateLayer` function if there is more than one layer in the layout; otherwise, only the top layer is updated during the rendering process.

-   **constructor(opt: TPainterOptions, coopt: CamOverlayDrawingOptions)**

    ```typescript
    type TPainterOptions = TFrameOptions & {
        screenWidth: number;
        screenHeight: number;
        coAlignment: string;
    };
    ```

-   **get camOverlayDrawingAPI()** - Returns the internal `CamOverlayDrawingAPI` object.

-   **get resourceManager()** - Returns the internal `ResourceManager` object.

-   **connect()** - Opens CamOverlayDrawingAPI.

-   **disconnect()** - Closes CamOverlayDrawingAPI.

-   **isConnected()** - Checks if CamOverlayDrawingAPI is connected. Returns true if connected, false otherwise.

-   **registerImage(moniker: string, fileName: string)** - Adds the image specified by `fileName` to the internal `ResourceManager`.

-   **registerFont(moniker: string, fileName: string)** - Adds the font specified by `fileName` to the internal `ResourceManager`.

-   **setScreenSize(width: number, height: number)** - Sets the size of the screen to draw on. The resolution of the screen is expected.

-   **setCoAlignment(alignment: string)** - Sets the alignment of this painter. Allowed values:

    > top_left, center_left, bottom_left
    > top_center, center, bottom_center
    > top_right, center_right, bottom_right

-   **async display(scale = 1)** - Renders this painter, including all inserted frames.

-   **async hide()** - Removes the displayed image from the camera. It has no effect on this `Painter` state.

-   **async invalidateLayer(layer: number)** - Invalidates the specified layer and all layers above it.

## Frame

-   Represents one field of graphics. Manages the display of an image, text, or background color. Supports nested frames too.

-   **Frame(options: TFrameOptions, customDraw?: TDrawingCallback)**

    ```typescript
    type TFrameOptions = {
        x: number;
        y: number;
        width: number;
        height: number;
        enabled?: boolean; // default: true
        bgImage?: string; // default: undefined
        text?: string; // default: ''
        fontColor?: TRgb; // default: [1.0, 1.0, 1.0]
        bgColor?: TRgba; // default: undefined
        bgType?: TObjectFitType; // default: undefined
        borderRadius?: number; // default: 0
        borderWidth?: number; // default: 0
        borderColor?: TRgba; // default: [1.0, 1.0, 1.0, 1.0]
        layer?: number; // default: 0
    };
    ```

    ```typescript
    type TDrawingCallback = (cod: CamOverlayDrawingAPI, cairo: string, info: TFrameInfo) => Promise<void>;
    ```

-   **enable()** - Enables rendering of the frame.

-   **disable()** - Disables rendering of the frame.

-   **setFramePosition(x: number, y: number)** - Sets this frame's position to [x, y] relative to the upper left edge of the parent frame.

-   **setFrameSize(width: number, height: number)** - Sets the width and height of this frame.

-   **setText(text: string, align: TAlign, textType: TTmf = 'TFM_OVERFLOW', fontColor?: TRgb)** - Sets which text will be displayed in this frame, its alignment, how to solve the situation when the text does not fit into the frame, and optionally a new color for the text.

    ```typescript
    type TAlign = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
    type TTmf = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
    ```

-   **setFontColor(fontColor: TRgb)** - Sets the font color of the text.

-   **setFont(fontName: string)** - Sets the font of the text. Use the moniker registered in ResourceManager.

-   **setFontData(fontData: TCairoCreateResponse)** - Sets the font data of the text.

-   **setBgColor(color: TRgba)** - Sets the background color of the frame.

-   **setBgImage(imageName: string, type: TObjectFitType = 'fit')** - Sets the background image of the frame. Use the moniker registered in ResourceManager.

-   **setBgImageData(imageData: TUploadImageResponse, type: TObjectFitType = 'fit')** - Allows displaying an image not registered in ResourceManager.

-   **setBgType(type: TObjectFitType)** - Sets the background type of the frame.

    ```typescript
    type TObjectFitType = 'fill' | 'fit' | 'none';
    ```

    -   **fill:** The image will be stretched to cover the entire frame area.
    -   **fit:** The image will be stretched to fit at least one side of the frame. The aspect ratio will be preserved.
    -   **none:** The image will be displayed as is.

-   **setBorderRadius(radius: number)** - Sets the border radius of the frame.

-   **setBorderWidth(width: number)** - Sets the border width of the frame.

-   **setBorderColor(color: TRgba)** - Sets the border color of the frame.

-   **setCustomDraw(customDraw: TDrawingCallback)** - Sets a callback which is run when the entire frame is displayed.

-   **resetFont()** - Removes the font from this frame.

-   **resetBgColor()** - Removes the background color from this frame.

-   **resetBgImage()** - Removes the background image from this frame.

-   **resetCustomDraw()** - Removes the customDraw callback from this frame.

-   **clear()** - Resets the frame to its default state.

-   **insert(...frames: Frame[])** - Inserts child frames into this frame.

-   **getLayers()** - Returns a set of unique layers used by this frame and its children.
