# CamOverlayPainter

Three modules for even easier control of the [CamOverlay drawing API](./CamOverlayDrawingAPI.md).

-   [ResourceManager](#resourcemanager): Download and store resources.
-   [Painter](#painter): Manage connection to CamOverlay and display of graphics.
-   [Frame](#frame): Manage one field of graphics - display image, text, or background color. Supports nested frames too.

<br/>

# ResourceManager

Downloads and stores resources.

## Methods

### registerImage(moniker, fileName)

Adds the image specified by `fileName` to this `ResourceManager`.

-   **Parameters:**
    -   `moniker` (`string`)
    -   `fileName` (`string`)

```typescript
m.registerImage('image1', 'image1.png');
```

### registerFont(moniker, fileName)

Adds the font specified by `fileName` to this `ResourceManager`.

-   **Parameters:**
    -   `moniker` (`string`)
    -   `fileName` (`string`)

```typescript
m.registerFont('OpenSansBold', 'OpenSans-Bold.ttf');
```

### image(moniker)

Uploads the image specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the image and its resolution.

-   **Parameters:**
    -   `moniker` (`string`)
-   **Returns:** `TUploadImageResponse`:

    ```typescript
    type TUploadImageResponse = {
        var: string;
        width: number;
        height: number;
        call_id: number;
    };
    ```

```typescript
await m.image('image1');
```

### font(moniker)

Uploads the font specified by `moniker` to the camera, if it hasn't been done already. Returns the name of the font.

-   **Parameters:**
    -   `moniker` (`string`)
-   **Returns:** `TCairoCreateResponse`:

    ```typescript
    type TCairoCreateResponse = {
        var: string;
        call_id: number;
    };
    ```

```typescript
await m.font('OpenSansBold');
```

### clear()

Removes all data from ResourceManager. Call this function when the connection to CamOverlay is closed.

<br/>

# Painter

Represents one widget, manages the connection to CamOverlay, and the display of graphics as a whole.

## Layers Usage

Layers are used to optimize drawing speed. It is possible to render the most dynamic frames to the top layer and update only this layer during the rendering process. If the layers are used, the painter caches the result of each layer to be able to partly refresh the image. It is also mandatory to use the `invalidateLayer` function if there is more than one layer in the layout; otherwise, only the top layer is updated during the rendering process.

## Constructor

-   **new Painter(opt: TPainterOptions, coopt: CamOverlayDrawingOptions)**

    ```typescript
    const painter = new Painter(
        {
            x: 0,
            y: 0,
            width: 500,
            height: 80,
            screenWidth: 1280,
            screenHeight: 720,
            coAlignment: 'top_right',
            bgColor: [0.2, 0.2, 0.2, 1],
        },
        {
            tls: false,
            tlsInsecure: false,
            ip: '127.0.0.1',
            port: 80,
            user: '',
            pass: '',
        }
    );
    ```

    ```typescript
    type TPainterOptions = TFrameOptions & {
        screenWidth: number;
        screenHeight: number;
        coAlignment: string;
    };
    ```

    ```typescript
    type TFrameOptions = {
        enabled?: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
        text?: string;
        fontColor?: TRgb;
        font?: string;
        bgColor?: TRgba;
        bgImage?: string;
        bgType?: TObjectFitType;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: TRgba;
        customDraw?: TDrawingCallback;
        layer?: number;
    };
    ```

    ```typescript
    type CamOverlayDrawingOptions {
        ip?: string;
        port?: number;
        user?: string;
        pass?: string;
        tls?: boolean;
        tlsInsecure?: boolean;
        camera?: number | number[];
        zIndex?: number;
    };
    ```

## Methods

### get camOverlayDrawingAPI()

Returns the internal `CamOverlayDrawingAPI` object.

### get resourceManager()

Returns the internal `ResourceManager` object.

### connect()

Opens CamOverlayDrawingAPI.

### disconnect()

Closes CamOverlayDrawingAPI.

### isConnected()

Checks if CamOverlayDrawingAPI is connected. Returns true if connected, false otherwise.

### registerImage(moniker, fileName)

Adds the image specified by `fileName` to the internal `ResourceManager`.

-   **Parameters:**
    -   `moniker` (`string`)
    -   `fileName` (`string`)

```typescript
painter.registerImage('image1', 'image1.png');
```

### registerFont(moniker, fileName)

Adds the font specified by `fileName` to the internal `ResourceManager`.

-   **Parameters:**
    -   `moniker` (`string`)
    -   `fileName` (`string`)

```typescript
painter.registerFont('OpenSansBold', 'OpenSans-Bold.ttf');
```

### setScreenSize(width, height)

Sets the size of the screen to draw on. The resolution of the screen is expected.

-   **Parameters:**
    -   `width` (`number`)
    -   `height` (`number`)

### setCoAlignment(coAlignment)

Sets the alignment of this painter.

-   **Parameters:**

    -   `coAlignment` (`TCoAlignment`):

    ```typescript
    type TCoAlignment =
        | 'top_left'
        | 'top_right'
        | 'center'
        | 'bottom_left'
        | 'bottom_right'
        | 'center_left'
        | 'top_center'
        | 'bottom_center'
        | 'center_right';
    ```

### display(scale)

Renders this painter, including all inserted frames.

-   **Parameters:**
    -   `scale` (`number`): default set to 1

### hide()

Removes the displayed image from the camera. It has no effect on this `Painter` state.

### async invalidateLayer(layer)

Invalidates the specified layer and all layers above it.

-   **Parameters:**
    -   `layer` (`number`)

<br/>

# Frame

Represents one field of graphics. Manages the display of an image, text, or background color. Supports nested frames too.

## Constructor

-   **new Frame(options: TFrameOptions, customDraw?: TDrawingCallback)**

    ```typescript
    const frame = new Frame({
        x: 13,
        y: 3,
        width: 100,
        height: 30,
        fontColor: [0.97, 0.75, 0.14],
    });
    ```

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

## Methods

### enable()

Enables rendering of the frame.

### disable()

Disables rendering of the frame.

### setFramePosition(x, y)

Sets this frame's position to [x, y] relative to the upper left edge of the parent frame.

-   **Parameters:**
    -   `x` (`number`)
    -   `y` (`number`)

### setFrameSize(width, height)

Sets the width and height of this frame.

-   **Parameters:**
    -   `width` (`number`)
    -   `height` (`number`)

### setText(text, align, textType, fontColor)

Sets which text will be displayed in this frame, its alignment, how to solve the situation when the text does not fit into the frame, and optionally a new color for the text.

-   **Parameters:**

    -   `text` (`string`)
    -   `align` (`TAlign`)
    -   `textType` (`TTmf` | `undefined`): default is set to `'TFM_OVERFLOW'`
    -   `fontColor` (`TRgb` | `undefined`)

    ```typescript
    type TAlign = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
    type TTmf = 'TFM_OVERFLOW' | 'TFM_SCALE' | 'TFM_TRUNCATE';
    type TRgb = [number, number, number];
    ```

```typescript
frame.setText('Hello', 'A_CENTER', 'TFM_OVERFLOW', [0, 45 / 255, 106 / 255]);
```

> [!IMPORTANT] > `fontColor` param is specified in numbers from 0 to 1

### setFontColor(fontColor)

Sets the font color of the text.

-   **Parameters:**
    -   `fontColor` (`TRgb`)

### setFont(fontName)

Sets the font of the text. Use the moniker registered in ResourceManager.

-   **Parameters:**
    -   `fontName` (`string`)

### setFontData(fontData)

Sets the font data of the text.

-   **Parameters:**
    -   `fontData` (`TCairoCreateResponse`)

### setBgColor(color: TRgba)

Sets the background color of the frame.

-   **Parameters:**
    -   `color` (`TRgba`)

### setBgImage(imageName, type)

Sets the background image of the frame. Use the moniker registered in ResourceManager.

-   **Parameters:**
    -   `imageName` (`string`)
    -   `type` (`TObjectFitType` | undefined): default set to `'fit'`

### setBgImageData(imageData, type)

Allows displaying an image not registered in ResourceManager.

-   **Parameters:**
    -   `imageData` (`TUploadImageResponse`)
    -   `type` (`TObjectFitType` | undefined): default set to `'fit'`

### setBgType(type)

Sets the background type of the frame.

-   **Parameters:**

    -   `type` (`TObjectFitType`):

    ```typescript
    type TObjectFitType = 'fill' | 'fit' | 'none';
    ```

    -   **fill:** The image will be stretched to cover the entire frame area.
    -   **fit:** The image will be stretched to fit at least one side of the frame. The aspect ratio will be preserved.
    -   **none:** The image will be displayed as is.

### setBorderRadius(radius)

Sets the border radius of the frame.

-   **Parameters:**
    -   `radius` (`number`)

### setBorderWidth(width)

Sets the border width of the frame.

-   **Parameters:**
    -   `width` (`number`)

### setBorderColor(color)

Sets the border color of the frame.

-   **Parameters:**
    -   `color` (`TRgba`)

### setCustomDraw(customDraw)

Sets a callback which is run when the entire frame is displayed.

-   **Parameters:**
    -   `customDraw` (`TDrawingCallback`)

### resetFont()

Removes the font from this frame.

### resetBgColor()

Removes the background color from this frame.

### resetBgImage()

Removes the background image from this frame.

### resetCustomDraw()

Removes the customDraw callback from this frame.

### clear()

Resets the frame to its default state.

### insert(frames)

Inserts child frames into this frame.

-   **Parameters:**
    -   `frames` (`Frame[]`)

### getLayers()

Returns a set of unique layers used by this frame and its children.

-   **Returns:** `Set<number>`
