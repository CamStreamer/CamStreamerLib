# CamOverlayAPI

Module for access to the CamOverlay HTTP interface.

## Constructor

-   **new CamOverlayAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamOverlayAPI } from 'camstreamerlib';

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

> [!TIP]
> The majority of CamOverlayAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

```typescript
type THttpRequestOptions = {
    timeout?: number;
    proxyParams?: {
        path: string;
        target: {
            ip: string;
            mdnsName: string;
            port: number;
            user: string;
            pass: string;
        };
    };
};
```

## Services

> [!IMPORTANT]
> Not all listed services are available through CamOverlay ACAP.

```typescript
// Common CamOverlay Service type
// (this type is not separately exported from cslib)
type TCommonService = {
    id: number;
    enabled: 0 | 1;
    automationType: 'time' | 'manual' | 'schedule' | `input${number}`;
    cameraList: number[];
    customName: string;
    width: number;
    height: number;
    schedule: string | undefined;
    invertInput: boolean | undefined;
    camera: number | undefined;
    zIndex: number | undefined;
};
```

```typescript
type TService =
    | TAccuweather
    | TCustomGraphics
    | TImages
    | TInfoticker
    | TPip
    | TPtzCompass
    | TPtz
    | TScreenSharing
    | TWebCameraSharing
    | TScoreBoard
    | TBaseballScoreBoard
    | TBaseballScoreBoardAutomatic
    | TScoreOverview;
```

### AccuWeather

Display weather data in specified location as overlay.

```typescript
type TAccuweather = TCommonService & {
    name: 'accuweather';
    clockType: '12h' | '24h';
    coordSystem:
        | 'top'
        | 'bottom'
        | 'top_left'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom_right';
    pos_y: number;
    font: string;
    location: string;
    locationName: string;
    title: string;
    bgStartColor: '237,143,73,0.93' | '0,0,0,0.75' | '31,32,73,0.9' | '76,94,127,0.95';
    bgEndColor: '0,0,0,0.75' | '234,181,89,0.93' | '73,96,213,0.9' | '140,150,168,0.95';
    lang:
        | 'en-us'
        | 'fr-fr'
        | 'ja-jp'
        | 'pt-pt'
        | 'es-es'
        | 'de-de'
        | 'ko-kr'
        | 'zh-hk'
        | 'zh-cn'
        | 'nl-nl'
        | 'cs-cz'
        | 'ru-ru'
        | 'sv-se';
    units: 'Metric' | 'Imperial';
    pos_x: number;
    layout: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13';
    scale: number;
};
```

### InfoTicker

Display dynamic text overlays with variables like time, weather, or sunrise, updated manually, from a URL, or via API.

```typescript
type TInfoticker = TCommonService & {
    name: 'infoticker';
    showClock: 0 | 1;
    clockType: '12h' | '24h';
    textColor: string;
    bgColor: string;
    weatherLocation: string;
    weatherLocationName: string;
    weatherLang:
        | 'en-us'
        | 'fr-fr'
        | 'ja-jp'
        | 'pt-pt'
        | 'es-es'
        | 'de-de'
        | 'ko-kr'
        | 'zh-hk'
        | 'zh-cn'
        | 'nl-nl'
        | 'cs-cz'
        | 'ru-ru'
        | 'sv-se';
    weatherUnits: 'Metric' | 'Imperial';
    numberOfLines: number;
    switchingTime: number;
    crawlLeft: boolean;
    crawlSpeed: number;
    coordSystem: 'top' | 'bottom';
    pos_y: number;
    font: string;
    fontSize: number;
    sourceType: 'text' | 'url';
    source: string;
};
```

### Images

Display and manage images or ads directly on your live video stream.

```typescript
type TImages = TCommonService & {
    name: 'images';
    overlayList: {
        pos_x: number;
        pos_y: number;
        coordSystem:
            | 'top_left'
            | 'top'
            | 'top_right'
            | 'left'
            | 'center'
            | 'right'
            | 'bottom_left'
            | 'bottom'
            | 'bottom_right';
        active: boolean;
        imgPath: string;
        imgName: string;
        duration: number;
        scale: number;
        fps: number | undefined;
    }[];
};
```

### PTZ Compass

Display a compass or map overlay to show your PTZ camera’s viewing direction and sector.

```typescript
type TPtzCompass = TCommonService & {
    name: 'ptzCompass';
    type: 'map' | 'compass' | 'image';
    pos_x: number;
    pos_y: number;
    coordSystem:
        | 'top_left'
        | 'top'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom'
        | 'bottom_right';
    scale: number;
    image: string;
    northPan: number;
    cameraPosX: number;
    cameraPosY: number;
    colorScheme: 'black' | 'white' | 'orange';
    generalLng: number | undefined;
    generalLat: number | undefined;
    generalZoom: number | undefined;
    generalMapType: string | undefined;
    generalIframeWidth: number | undefined;
    generalIframeHeight: number | undefined;
    generalAddress: string | undefined;
};
```

### PTZ Overlay

Display images, ads, or infographics to each PTZ preset position.

```typescript
type TPtz = TCommonService & {
    name: 'ptz';
    ptz_positions: Record<
        string,
        {
            overlayList: {
                pos_x: number;
                pos_y: number;
                coordSystem:
                    | 'top_left'
                    | 'top'
                    | 'top_right'
                    | 'left'
                    | 'center'
                    | 'right'
                    | 'bottom_left'
                    | 'bottom'
                    | 'bottom_right';
                imgPath: string;
                imgName: string;
                duration: number;
                scale: number;
            }[];
            loop: boolean;
        }
    >;
};
```

### Custom Graphics

Display dynamic text in the background graphics within your video stream.

```typescript
type TCustomGraphics = TCommonService & {
    name: 'customGraphics';
    pos_x: number;
    pos_y: number;
    coordSystem:
        | 'top_left'
        | 'top'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom'
        | 'bottom_right';
    image: string;
    clockFormat: '12h' | '24h';
    background: 'custom' | 'image';
    customAreaColor: string;
    customAreaWidth: number;
    customAreaHeight: number;
    customAreaCorners: 'sharp' | 'rounded';
    mappingZones: (
        | {
              type: 'plain';
              name: string;
              textColor: string;
              switchingTime: number;
              pos_y: number;
              font: string;
              fontSize: number;
              pos_x: number;
              wrapText: boolean;
              textLines: number;
              textWidth: number;
              textAlign: 'A_LEFT' | 'A_CENTER' | 'A_RIGHT';
              textVerticalAlign: 'VA_TOP' | 'VA_CENTER' | 'VA_BOTTOM';
              text: { source: string; active: boolean }[] | undefined;
          }
        | {
              type: 'countdown';
              name: string;
              textColor: string;
              switchingTime: number;
              pos_y: number;
              font: string;
              fontSize: number;
              pos_x: number;
              wrapText: boolean;
              textLines: number;
              textWidth: number;
              textAlign: 'A_LEFT' | 'A_CENTER' | 'A_RIGHT';
              textVerticalAlign: 'VA_TOP' | 'VA_CENTER' | 'VA_BOTTOM';
              settings: {
                  startDate: number;
                  targetDate: number;
                  countdown: boolean;
                  countup: boolean;
                  displayDay: boolean;
                  displayHour: boolean;
                  displayMinute: boolean;
                  displaySeconds: boolean;
                  idleText: string;
                  hideZeros: boolean;
                  delimiter: 'colon' | 'letters';
                  suffixSeconds: string;
                  suffixMinute: string;
                  suffixHour: string;
                  suffixDay: string;
                  loop: boolean;
                  loopPeriod: number;
                  waitingPeriod: number;
              };
              text: { source: string; active: boolean }[] | undefined;
          }
    )[];
};
```

### Picture in Picture

Insert the picture from another camera on the same network into your live stream.

```typescript
type TPip = TCommonService & {
    name: 'pip';
    compression: number;
    coordSystem:
        | 'top'
        | 'bottom'
        | 'top_left'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom_right';
    pos_y: number;
    pos_x: number;
    scale: number;
    fps: number;
    screenSize: number;
    source_type: 'axis_camera' | 'mjpeg_url';
    mjpeg_url: string;
    camera_ip: string;
    camera_port: number;
    camera_user: string;
    camera_pass: string;
    camera_width: number;
    camera_height: number;
    camera_view_area: string;
    camera_overlay_params:
        | 'overlays=off'
        | 'overlays=all'
        | 'overlays=text'
        | 'overlays=image'
        | 'overlays=application';
    rotate: 0 | 90 | 180 | 270;
    dewarping: { enabled: boolean; rectangle: [number, number][]; aspectRatioCorrection: number };
    borderColor: string;
    borderWidth: number;
};
```

### Screen Sharing

Share your screen, application window, or browser tab as a PiP in the video feed. This service only works when connected via HTTPS.

```typescript
type TScreenSharing = TCommonService & {
    name: 'screenSharing';
    coordSystem:
        | 'top'
        | 'bottom'
        | 'top_left'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom_right';
    pos_y: number;
    pos_x: number;
    fps: number;
    screenSize: number;
};
```

### Web Camera Sharing

Share any camera available on your computer. This service only works when connected via HTTPS.

```typescript
type TWebCameraSharing = TCommonService & {
    name: 'web_camera';
    coordSystem:
        | 'top'
        | 'bottom'
        | 'top_left'
        | 'top_right'
        | 'left'
        | 'center'
        | 'right'
        | 'bottom_left'
        | 'bottom_right';
    pos_y: number;
    pos_x: number;
    fps: number;
    screenSize: number;
};
```

### Score Board

```typescript
type TScoreBoard = {
    enabled: 0 | 1;
    scale: number;
    width: number;
    height: number;
    cameraList: number[];
    name: 'scoreBoard';
    font: string;
    id: number;
    zIndex: number;
    coordSystem:
        | 'top_left'
        | 'top_right'
        | 'bottom_left'
        | 'bottom_right'
        | 'top'
        | 'bottom'
        | 'left'
        | 'center'
        | 'right';
    pos_y: number;
    pos_x: number;
    teamHomeShortname: string;
    teamGuestShortname: string;
    teamHomeBackgroundColor: string;
    teamGuestBackgroundColor: string;
    teamHomeTextColor: string;
    teamGuestTextColor: string;
    teamHomeImgPath: string;
    teamGuestImgPath: string;
    teamHomeCurrentScore: number;
    teamGuestCurrentScore: number;
    baseTimeTimestamp: number;
    baseTimePlaytime: number;
    currentPeriodPlaytime: number;
    timeIsRunning: boolean;
    currentPeriodLength: number;
    currentPeriod: number;
    schedule: string | undefined;
};
```

### Baseball Score Board

```typescript
type TBaseballScoreBoard = {
    enabled: 0 | 1;
    scale: number;
    width: number;
    height: number;
    cameraList: number[];
    name: 'baseballScoreBoard';
    font: string;
    id: number;
    zIndex: number;
    coordSystem:
        | 'top_left'
        | 'top_right'
        | 'bottom_left'
        | 'bottom_right'
        | 'top'
        | 'bottom'
        | 'left'
        | 'center'
        | 'right';
    pos_y: number;
    pos_x: number;
    teamHomeShortname: string;
    teamGuestShortname: string;
    teamHomeBackgroundColor: string;
    teamGuestBackgroundColor: string;
    teamHomeTextColor: string;
    teamGuestTextColor: string;
    teamHomeCurrentScore: number;
    teamGuestCurrentScore: number;
    baseTimeTimestamp: number;
    baseTimePlaytime: number;
    timeIsRunning: boolean;
    matchFinished: boolean;
    bases: [boolean, boolean, boolean];
    homeInning: boolean;
    inning: number;
    outs: number;
    balls: number;
    strikes: number;
    schedule: string | undefined;
    footerImgPath: string | undefined;
    footerText: string | undefined;
    footerBackgroundColor: string | undefined;
    footerTextColor: string | undefined;
};
```

### Baseball Automatic Score Board

```typescript
type TBaseballScoreBoardAutomatic = {
    enabled: 0 | 1;
    scale: number;
    width: number;
    height: number;
    cameraList: number[];
    name: 'myBallBaseballWidgets';
    font: string;
    id: number;
    zIndex: number;
    teamHomeBackgroundColor: string;
    teamGuestBackgroundColor: string;
    teamHomeTextColor: string;
    teamGuestTextColor: string;
    matchDetailLink: string;
    matchListLink: string;
    mirrored: boolean;
    pregameWidgetText: string;
    homeLogoPath: string;
    guestLogoPath: string;
    schedule: string | undefined;
    footerImgPath: string | undefined;
    footerText: string | undefined;
    footerBackgroundColor: string | undefined;
    footerTextColor: string | undefined;
};
```

### Score Overview

```typescript
type TScoreOverview = {
    enabled: 0 | 1;
    scale: number;
    width: number;
    height: number;
    cameraList: number[];
    name: 'scoreOverview';
    id: number;
    zIndex: number;
    coordSystem:
        | 'top_left'
        | 'top_right'
        | 'bottom_left'
        | 'bottom_right'
        | 'top'
        | 'bottom'
        | 'left'
        | 'center'
        | 'right';
    pos_y: number;
    pos_x: number;
    teamHomeBackgroundColor: string;
    teamGuestBackgroundColor: string;
    teamHomeTextColor: string;
    teamGuestTextColor: string;
    teamHomeImgPath: string;
    teamGuestImgPath: string;
    teamHomeCurrentScore: number;
    teamGuestCurrentScore: number;
    teamHomeName: string;
    teamGuestName: string;
    scoreVisible: boolean;
    description: string;
    textFont: string;
    scoreFont: 'classic';
};
```

## Static

### getBasePath()

Returns the base path of camoverlay API

-   **Returns:** `string`

```javascript
const basePath = CamOverlayAPI.getBasePath();
```

### getProxyPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const proxyPath = CamOverlayAPI.getProxyPath();
```

### getFilePreviewPath(path)

Returns path to a file.

-   **Parameters:**
    -   `path` (`string`)
-   **Returns:** `string`

```javascript
const preview = CamOverlayAPI.getFilePreviewPath(path);
```

## Methods - Common

### getClient(proxyParams?)

Returns CamOverlay client - can be used in custom CamOverlay API calls.

-   **Parameters:**

    -   `proxyParams` (`TProxyParams`, optional)

    ```typescript
    type TProxyParams =
        | {
              path: string;
              target: TProxyTarget;
          }
        | undefined;
    ```

-   **Returns:** `Client | ProxyClient<Client>`

```javascript
const client = coApi.getClient();
```

### checkCameraTime(options?)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await coApi.checkCameraTime();
```

### getNetworkCameraList(options?)

Find cameras on local network using mDNS protocol.

-   **Parameters:**

    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<TNetworkCameraList>`:

    ```typescript
    type TNetworkCameraList = {
        name: string;
        ip: string;
    }[];
    ```

```javascript
const list = await coApi.getNetworkCameraList();
```

### wsAuthorization(options?)

Gets the WebSocket authorization token to authorize event websocket.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
const token = await coApi.wsAuthorization();
```

### getMjpegStreamImage(mjpegUrl, options?)

-   **Parameters:**
    -   `mjpegUrl` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

```javascript
const image = await coApi.getMjpegStreamImage(url);
```

## Methods - Files

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

### listFiles(fileType, options?)

List all images or files uploaded to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TFile[]>` ([`TFile`](#types))

```javascript
const images = await coApi.listFiles('image');
```

### uploadFile(fileType, formData, storage, options?)

Uploads a new file to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `formData` (FormData)
    -   `storage` ([`TStorage`](#types))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.uploadFile('image', data, 'url');
```

### removeFile(fileType, fileParams, options?)

Removes file from the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `fileParams` ([`TFile`](#types))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.removeFile('font', fontData);
```

### getFileStorage(fileType, options?)

Gets information about files storage.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TStorageDataList>` ([`TStorageDataList`](#types))

```javascript
const storage = await coApi.getFileStorage('font');
```

### getFilePreviewFromCamera(path, options?)

-   **Parameters:**
    -   `path` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

```javascript
const preview = await coApi.getFilePreviewFromCamera(path);
```

### Methods - CamOverlay services

See list of all available services: [`Services`](#services)

### updateInfoticker(serviceId, text, options?)

Updates text in the [`Infoticker`](#infoticker) service, if any is running.

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `text` (`string`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateInfoticker(id, text);
```

### setEnabled(serviceId, enabled, options?)

Enables/disables the bound CO service.

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `enabled` (`boolean`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.setEnabled(id, true);
```

### isEnabled(serviceId, options?)

Returns whether the bound CO service is enabled (true) or disabled (false).

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isEnabled = await coApi.isEnabled(id);
```

### getSingleService(serviceId, options?)

Returns the complete settings of the given CamOverlay service.

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TService>`](#services)

```javascript
const service = await coApi.getSingleService(id);
```

### getServices(options?)

Returns the complete settings of all CamOverlay services.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TService[]>`](#services)

```javascript
const services = await coApi.getServices();
```

### updateSingleService(service, options?)

Changes the settings of the given CamOverlay service.

-   **Parameters:**
    -   `service` ([`TService`](#services))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateSingleService(service);
```

### updateServices(services, options?)

Changes the settings of all CamOverlay services.

-   **Parameters:**
    -   `services` ([`TService[]`](#services))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateServices(services);
```

### Methods - Custom Graphics

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

### updateCGText(serviceId, fields, options?)

Updates text fields listed in the parameter fields.

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `fields` ([`TField[]`](#types-1))
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
await coApi.updateCGText(id, fields);
```

### updateCGImagePos(serviceId, coordinates?, x?, y?, options?)

Changes the position of Custom Graphics.

-   **Parameters:**
    -   `serviceId` (`number`)
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`)
    -   `x` (`number`, optional, default = `0`)
    -   `y` (`number`, optional, default = `0`)
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImagePos(id, 'top');
```

### updateCGImage(serviceId, path, coordinates?, x?, y?, options?)

Updates the Custom Graphics background to an image with the specified path on the camera.
If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**

    -   `serviceId` (`number`)
    -   `path` (`string`)
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`)
    -   `x` (`number`, optional, default = `0`)
    -   `y` (`number`, optional, default = `0`)
    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImage(id, path, 'bottom_right');
```

### updateCGImageFromData(serviceId, imageType, imageData, coordinates?, x?, y?, options?)

Updates the Custom Graphics background to an image passed as
the imageData argument. If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**

    -   `serviceId` (`number`)
    -   `imageType` ([`ImageType`](#types-1))
    -   `imageData` (`Parameters<Client['post']>[0]['data']`)
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`)
    -   `x` (`number`, optional, default = `0`)
    -   `y` (`number`, optional, default = `0`)
    -   `options` (`THttpRequestOptions`, optional)

-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImageFromData(id, type, data, 'bottom', 0, 0);
```
