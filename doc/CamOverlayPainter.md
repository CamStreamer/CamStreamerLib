# CamOverlayPainter

Three modules for even easier control of CamOverlay drawing API.

## ResourceManager

-   Downloads and stores resources.

-   **registerImage(moniker: string, fileName: string), registerFont(moniker: string, fileName: string)** - Adds the resource specified by `fileName` to this `ResourceManager`.

-   **async image(co: CamOverlayDrawingAPI, moniker: string): TUploadImageResponse** - Uploads the image specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the images and its resolution.

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

-   Represents one field of graphics. Manages the display of an image, text or background colour. Supports nested frames too.

-   **Frame(options: FrameOptions, rm: ResourceManager, customDraw?: TDrawingCallback)**

    ```typescript
    type FrameOptions = {
        x: number;
        y: number;
        width: number;
        height: number;

        enabled?: boolean; // default: true
        bgImage?: string; // default: undefined
        text?: string; // default: ''
        fontColor?: RGB; // default: [1.0, 1.0, 1.0]
        bgColor?: RGBA; // default: undefined
        bgType?: ObjectFitType; // dafault: undefined
    };
    ```

    ```typescript
    type TDrawingCallback = (cod: CamOverlayDrawingAPI, cairo: string) => Promise<void>;
    ```

-   **setFramePosition(x: number, y: number)** - Sets this frame position to [x,y] relative to the upper left edge of the parent frame.

-   **setFrameSize(width: number, height: number)** - Sets the width and height of this frame.

-   **setText(text: string, align: Align, textType: TMF = 'TFM_OVERFLOW', color?: RGB)** - Sets which text will be displayed in this frame, its aligment, how to solve the situation when the text does not fit into the frame and optionally new color of the text.

    ```typescript
    type TAlign = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
    type TTmf = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
    ```

-   **setFont(fontName: string)** - As a fontName use the moniker registered in ResourceManager.

-   **setBgColor(color: RGBA)** - Sets colour displayed on the frame background.

-   **setBgImage(imageName: string, type: ObjectFitType)** - As an imageName use the moniker registered in ResourceManager.

-   **setCustomDraw(customDraw: TDrawingCallback)** - Sets a callback which is run when the entire frame is displayed.

    ```typescript
    type TObjectFitType = 'fill' | 'fit' | 'none';
    ```

    > fill: The image will be stretched to cover the entire frame area.
    > fit: The image will be stretched to fit at least one side of the frame. The aspect ratio will be preserved.
    > none: The image will be displayed as is.

-   **clear()** - Resets frame to its default state.

-   **insert(...frames: Frame[])**

-   **enable()** - Allows this frame and its children to display.

-   **disable()** - Disallows this frame and its children to display.

## Painter

-   Represents one widget, manages the connection to CamOverlay and the display of graphics as a whole.

-   **constructor(opt: PainterOptions, coopt: CamOverlayDrawingOptions, rm: ResourceManager)**

    ```typescript
    type PainterOptions = FrameOptions & {
        screenWidth: number;
        screenHeight: number;
        coAlignment: string;
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
