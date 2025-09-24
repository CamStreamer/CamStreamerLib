# CamOverlayAPI

Module for access to the CamOverlay HTTP interface.

## Constructor

-   **new CamOverlayAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/esm/node';
import { CamOverlayAPI } from 'camstreamerlib/esm';

const coApi = new CamOverlayAPI(
    new DefaultClient({
        tls: false,
        tlsInsecure: false,
        ip: '127.0.0.1',
        port: 80,
        user: '',
        pass: '',
    })
);
```

## Static

### getProxyUrlPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const url = CamOverlayAPI.getProxyUrlPath();
```

### getFilePreviewPath(path)

Returns path to a file.

-   **Parameters:**
    -   `path` (string)
-   **Returns:** `string`

```javascript
const preview = CamOverlayAPI.getFilePreviewPath(path);
```

## Methods common

### checkCameraTime()

Check camera time against CamStreamer server.

-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await coApi.checkCameraTime();
```

### getNetworkCameraList()

Find cameras on local network using mDNS protocol.

-   **Returns:**
    ```typescript
    Promise<
        Array<{
            name: string;
            ip: string;
        }>
    >;
    ```

```javascript
const list = await coApi.getNetworkCameraList();
```

### wsAuthorization()

Gets the WebSocket authorization token to authorize event websocket.

-   **Returns:** `Promise<string>`

```javascript
const token = await coApi.wsAuthorization();
```

### getMjpegStreamImage()

-   **Returns:** `Promise<Blob>`

```javascript
const image = await coApi.getMjpegStreamImage();
```

## Methods Files

### types

```typescript
type TFileType = 'image' | 'font';
```

```typescript
type TStorage = 'url' | 'flash' | 'SD0' | 'ftp' | 'samba';
```

```typescript
type TFile = {
    path: string;
    name: string;
    storage: TStorage;
};
```

```typescript
type TStorageDataList = {
    type: TStorage;
    state: string;
}[];
```

### listFiles(fileType)

List all images or files uploaded to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
-   **Returns:** `Promise<TFile[]>;` ([`TFile`](#types))

```javascript
const images = await coApi.listFiles('image');
```

### uploadFile(fileType, formData, storage)

Uploads a new file to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `formData` (FormData)
    -   `storage` ([`TStorage`](#types))
-   **Returns:** `Promise<void>`

```javascript
await coApi.uploadFile('image', data, 'url');
```

### removeFile(fileType, fileParams)

Removes file from the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `fileParams` ([`TFile`](#types)):
-   **Returns:** `Promise<void>`

```javascript
await coApi.removeFile('font', fontData);
```

### getFileStorage(fileType)

Gets information about files storage.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
-   **Returns:** `Promise<TStorageDataList>` ([`TStorageDataList`](#types))

```javascript
const storage = await coApi.getFileStorage('font');
```

### getFilePreviewFromCamera(path)

```javascript
const preview = await coApi.getFilePreviewFromCamera(path);
```

### CamOverlay services

### updateInfoticker(serviceId, text)

Updates text in the Infoticker service, if any is running.

-   **Parameters:**
    -   `serviceId` (number)
    -   `text` (string)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateInfoticker(id, text);
```

### setEnabled(serviceId, enabled)

Enables/disables the bound CO service.

-   **Parameters:**
    -   `serviceId` (number)
    -   `enabled` (boolean)
-   **Returns:** `Promise<void>`

```javascript
await coApi.setEnabled(id, true);
```

### isEnabled(serviceId)

Returns whether the bound CO service is enabled (true) or disabled (false).

-   **Parameters:**
    -   `serviceId` (number)
-   **Returns:** `Promise<boolean>`

```javascript
const isEnabled = await coApi.isEnabled(id);
```

### getSingleWidget(serviceId)

Returns the complete settings of the given CamOverlay service.

-   **Parameters:**
    -   `serviceId` (number)

```javascript
const widget = await coApi.getSingleWidget(id);
```

### getWidgets()

Returns the complete settings of all CamOverlay services.

```javascript
const widgets = await coApi.getWidgets();
```

### updateSingleWidget(widget)

Changes the settings of the given CamOverlay service.

-   **Returns:** `Promise<void>`

```javascript
await coApi.updateSingleWidget(widget);
```

### updateWidgets(widgets)

Changes the settings of all CamOverlay services.

-   **Returns:** `Promise<void>`

```javascript
await coApi.updateWidgets(widgets);
```

### Custom Graphics

### types

```typescript
type TField = {
    text: string;
    field_name: string;
    color: string | undefined;
};
```

```typescript
type TCoordinates =
    | 'top_left'
    | 'top_right'
    | 'top'
    | 'bottom_left'
    | 'bottom_right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | '';
```

```typescript
enum ImageType {
    PNG,
    JPEG,
}
```

### updateCGText(serviceId, fields)

Updates text fields listed in the parameter fields.

-   **Parameters:**
    -   `serviceId` (number)
    -   `fields` ([`TField[]`](#types-1))
-   **Returns:** `Promise<boolean>`

```javascript
await coApi.updateCGText(id, fields);
```

### updateCGImagePos(serviceId, coordinates, x, y)

Changes the position of Custom Graphics.

-   **Parameters:**
    -   `serviceId` (number)
    -   `coordinates` ([`TCoordinates`](#types-1) | undefined)
    -   `x` (number | undefined)
    -   `y` (number | undefined)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImagePos(id, 'top');
```

### updateCGImage(serviceId, path, coordinates, x, y)

Updates the Custom Graphics background to an image with the specified path on the camera.
If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**
    -   `serviceId` (number)
    -   `path` (string)
    -   `coordinates` ([`TCoordinates`](#types-1) | undefined)
    -   `x` (number | undefined)
    -   `y` (number | undefined)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImage(id, path, 'bottom_right');
```

### updateCGImageFromData(serviceId, imageType, imageData, coordinates, x, y)

Updates the Custom Graphics background to an image passed as
the imageData argument. If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**

    -   `serviceId` (number)
    -   `imageType` ([`ImageType`](#types-1))
    -   `imageData` (Buffer)
    -   `coordinates` ([`TCoordinates`](#types-1) | undefined)
    -   `x` (number | undefined)
    -   `y` (number | undefined)

-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImageFromData(id, type, data, 'bottom', 0, 0);
```
