# CamOverlayAPI

Module for access to the CamOverlay HTTP interface.

## Overview

-   [Constructor](#constructor)
-   [List of CamOverlay Services](#services)
-   [Methods](#static-methods)
    -   [Static](#static-methods)
    -   [Common](#common-methods)
    -   [Files Management](#files-management-methods): Manage images and fonts.
    -   [CamOverlay Services](#camoverlay-services-methods): Manage CamOverlay widgets.
    -   [Custom Graphics](#custom-graphics-methods): Manage Custom Graphics widget.
    -   [App Report](#report-methods): Get app report data.

<br/>

## Constructor

-   **new CamOverlayAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamOverlayAPI } from 'camstreamerlib';

const coApi = new CamOverlayAPI(new DefaultClient());
```

> [!TIP]
> The <b>majority of CamOverlayAPI</b> methods accept <b>optional `options` parameter</b> of type `THttpRequestOptions`:

```typescript
type THttpRequestOptions = {
    timeout?: number; // in miliseconds
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

<br/>

## Services

> [!IMPORTANT] > <b>Not all listed services are available</b> through CamOverlay ACAP.

```typescript
// Common CamOverlay Service type
// (this type is not separately exported from cslib)
type TCommonService = {
    id: number;
    enabled: 0 | 1; // state of widget (on/off)
    automationType: 'time' | 'manual' | 'schedule' | `input${number}`; // when is widget displayed
    cameraList: number[]; // list of camera view areas for which the widget is used
    customName: string;
    width: number; // resolution
    height: number; // resolution
    schedule: string | undefined; // widget display time schedule
    invertInput: boolean | undefined;
    camera: number | undefined; // depracated, could be used in older versions
    zIndex: number | undefined; // widget layer position, higher number is on top
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
    coordSystem: // position of the widget
    'top' | 'bottom' | 'top_left' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom_right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    font: string; // used font
    location: string; // geographical location
    locationName: string; // geographical location name, e.g. Prague
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
    layout: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13'; // id of widget preset layout
    scale: number; // percent, e.g. 0.5 (= 50%)
};
```

### InfoTicker

Display dynamic text overlays with variables like time, weather, or sunrise, updated manually, from a URL, or via API.

```typescript
type TInfoticker = TCommonService & {
    name: 'infoticker';
    showClock: 0 | 1; // show time in widget
    clockType: '12h' | '24h';
    textColor: string;
    bgColor: string;
    weatherLocation: string; // geographical location
    weatherLocationName: string; // geographical location name, e.g. Prague
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
    numberOfLines: number; // multiline text
    switchingTime: number;
    crawlLeft: boolean; // text animation, moving to the left
    crawlSpeed: number; // text animation speed
    coordSystem: 'top' | 'bottom';
    pos_y: number; // vertical offset
    font: string;
    fontSize: number;
    sourceType: 'text' | 'url'; // source of the text used in widget
    source: string; // path to the source text
};
```

### Images

Display and manage images or ads directly on your live video stream.

```typescript
type TImages = TCommonService & {
    name: 'images';
    // list of images used in widget
    overlayList: {
        pos_y: number; // vertical offset
        pos_x: number; // horizontal offset
        coordSystem: // image position
        'top_left' | 'top' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom' | 'bottom_right';
        active: boolean; // is currently used
        imgPath: string;
        imgName: string;
        duration: number; // for how long should image be used/visible
        scale: number; // percent, e.g. 0.5 (= 50%)
        fps: number | undefined; // frames per second
    }[];
};
```

### PTZ Compass

Display a compass or map overlay to show your PTZ camera’s viewing direction and sector.

```typescript
type TPtzCompass = TCommonService & {
    name: 'ptzCompass';
    type: 'map' | 'compass' | 'image';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    coordSystem: // position of the widget
    'top_left' | 'top' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom' | 'bottom_right';
    scale: number; // percent, e.g. 0.5 (= 50%)
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
            // list of images used in widget
            overlayList: {
                pos_y: number; // vertical offset
                pos_x: number; // horizontal offset
                coordSystem: // position of the image
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
                duration: number; // for how long should image be used/visible
                scale: number; // percent, e.g. 0.5 (= 50%)
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
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    coordSystem: // position of the widget
    'top_left' | 'top' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom' | 'bottom_right';
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
    coordSystem: // position of the widget
    'top' | 'bottom' | 'top_left' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom_right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    scale: number; // percent, e.g. 0.5 (= 50%)
    fps: number;
    screenSize: number;
    source_type: 'axis_camera' | 'mjpeg_url';
    mjpeg_url: string; // url picture source (picture source === 'mjpeg_url')
    rotate: 0 | 90 | 180 | 270;
    dewarping: { enabled: boolean; rectangle: [number, number][]; aspectRatioCorrection: number };
    borderColor: string;
    borderWidth: number;
    // remote camera information (picture source === 'axis_camera')
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
};
```

### Screen Sharing

Share your screen, application window, or browser tab as a PiP in the video feed. This service only works when connected via HTTPS.

```typescript
type TScreenSharing = TCommonService & {
    name: 'screenSharing';
    coordSystem: // position of the widget
    'top' | 'bottom' | 'top_left' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom_right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    fps: number;
    screenSize: number;
};
```

### Web Camera Sharing

Share any camera available on your computer. This service only works when connected via HTTPS.

```typescript
type TWebCameraSharing = TCommonService & {
    name: 'web_camera';
    coordSystem: // position of the widget
    'top' | 'bottom' | 'top_left' | 'top_right' | 'left' | 'center' | 'right' | 'bottom_left' | 'bottom_right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
    fps: number;
    screenSize: number;
};
```

### Score Board

```typescript
type TScoreBoard = {
    enabled: 0 | 1; // state of widget (on/off)
    scale: number;
    width: number;
    height: number;
    cameraList: number[]; // list of camera view areas for which the widget is used
    name: 'scoreBoard';
    font: string;
    id: number;
    zIndex: number; // widget layer position, higher number is on top
    coordSystem: // position of the widget
    'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'bottom' | 'left' | 'center' | 'right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
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
    enabled: 0 | 1; // state of widget (on/off)
    scale: number;
    width: number;
    height: number;
    cameraList: number[]; // list of camera view areas for which the widget is used
    name: 'baseballScoreBoard';
    font: string;
    id: number;
    zIndex: number; // widget layer position, higher number is on top
    coordSystem: // position of the widget
    'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'bottom' | 'left' | 'center' | 'right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
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
    enabled: 0 | 1; // state of widget (on/off)
    scale: number;
    width: number;
    height: number;
    cameraList: number[]; // list of camera view areas for which the widget is used
    name: 'myBallBaseballWidgets';
    font: string;
    id: number;
    zIndex: number; // widget layer position, higher number is on top
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
    enabled: 0 | 1; // state of widget (on/off)
    scale: number;
    width: number;
    height: number;
    cameraList: number[]; // list of camera view areas for which the widget is used
    name: 'scoreOverview';
    id: number;
    zIndex: number; // widget layer position, higher number is on top
    coordSystem: // position of the widget
    'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top' | 'bottom' | 'left' | 'center' | 'right';
    pos_y: number; // vertical offset
    pos_x: number; // horizontal offset
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

<br/>

## Static Methods

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
const preview = CamOverlayAPI.getFilePreviewPath('file://path-to-img/image.jpg');
```

## Common Methods

### getClient(proxyParams?)

Returns CamOverlay client - can be used in custom CamOverlay API calls.

-   **Parameters:**

    -   `proxyParams` (`TProxyParams`, optional)

    ```typescript
    type TProxyParams =
        | {
              path: string;
              target: {
                  ip: string;
                  mdnsName: string;
                  port: number;
                  user: string;
                  pass: string;
              };
          }
        | undefined;
    ```

-   **Returns:** `Client | ProxyClient<Client>`

```javascript
const client = coApi.getClient();
```

### checkAPIAvailable(options?)

Dummy endpoint to check if API is available.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.checkAPIAvailable();
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
    -   `mjpegUrl` (`string`): Motion JPEG stream URL.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

```javascript
const image = await coApi.getMjpegStreamImage(url);
```

<br/>

## Files Management Methods

### types

```typescript
type TFileType = 'image' | 'font';
```

```typescript
type TImageFileStorageType = 'flash' | 'SD0' | 'ftp' | 'samba' | 'url';
type TFontFileStorageType = 'flash' | 'SD0';

type TFileStorageType<T extends TFileType> = T extends 'image' ? TImageFileStorageType : TFontFileStorageType;
```

```typescript
type TImageFile = {
    path: string;
    name: string;
    storage: TImageFileStorageType;
};
type TFontFile = {
    path: string;
    name: string;
    storage: TFontFileStorageType;
};

type TFile<T extends TFileType> = T extends 'image' ? TImageFile : TFontFile;
```

```typescript
type TImageStorageDataList = {
    type: TImageFileStorageType;
    state: string;
}[];
type TFontStorageDataList = {
    type: TFontFileStorageType;
    state: string;
}[];

type TStorageDataList<T extends TFileType> = T extends 'image' ? TImageStorageDataList : TFontStorageDataList;
```

### listFiles(fileType, options?)

List all images or files uploaded to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types)): Which file type to get.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TFile[]>` ([`TFile`](#types))

```javascript
const images = await coApi.listFiles('image');
```

### uploadFile(fileType, formData, storage, options?)

Uploads a new file to the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types)): Which file type to upload.
    -   `formData` (`Parameters<Client['post']>[0]['data']`): File data (e.g. Blob, ArrayBuffer).
    -   `storage` ([`TFileStorageType<T extends TFileType>`](#types)): Where to upload the file data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.uploadFile('image', data, 'url');
```

### removeFile(fileType, fileParams, options?)

Removes file from the camera.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types)): Which file type to remove.
    -   `fileParams` ([`TFile<T extends TFileType>`](#types)): File information.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.removeFile('font', fontData);
```

### getFileStorage(fileType, options?)

Gets information about files storage.

-   **Parameters:**
    -   `fileType` ([`TFileType`](#types)): Which file type.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TStorageDataList<T extends TFileType>>`](#types)

```javascript
const storage = await coApi.getFileStorage('font');
```

### getFilePreviewFromCamera(path, options?)

-   **Parameters:**
    -   `path` (`string`): Path to the wanted file.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<Blob>`

```javascript
const preview = await coApi.getFilePreviewFromCamera('file://path-to-img/image.jpg');
```

<br/>

## CamOverlay Services Methods

See list of all available services: [`Services`](#services)

### updateInfoticker(serviceId, text, options?)

Updates text in the [`Infoticker`](#infoticker) service, if any is running.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `text` (`string`): Text displayed in the service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateInfoticker(2, 'Hello');
```

### setEnabled(serviceId, enabled, options?)

Enables/disables the bound CO service.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `enabled` (`boolean`): Start or stop the service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.setEnabled(2, true);
```

### isEnabled(serviceId, options?)

Returns whether the bound CO service is enabled (true) or disabled (false).

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isEnabled = await coApi.isEnabled(2);
```

### getSingleService(serviceId, options?)

Returns the complete settings of the given CamOverlay service.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** [`Promise<TService>`](#services)

```javascript
const service = await coApi.getSingleService(2);
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
    -   `service` ([`TService`](#services)): Configuration of the service.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateSingleService(service);
```

### updateServices(services, options?)

Changes the settings of all CamOverlay services.

-   **Parameters:**
    -   `services` ([`TService[]`](#services)): List of services configurations.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateServices(services);
```

<br/>

## Custom Graphics Methods

### types

```typescript
type TField = {
    text: string; // text displayed in the field
    field_name: string; // name of the field
    color: string | undefined; // color of the text
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
    -   `serviceId` (`number`): Id of the service.
    -   `fields` ([`TField[]`](#types-1)): List of field configuration.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGText(6, [{ text: 'Hello', field_name: 'field1', color: 'red' }]);
```

### updateCGImagePos(serviceId, coordinates?, x?, y?, options?)

Changes the position of Custom Graphics.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`): Position of the image.
    -   `x` (`number`, optional, default = `0`): Offset of the image on X axis.
    -   `y` (`number`, optional, default = `0`): Offset of the image on Y axis.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImagePos(4, 'top', 20, 5);
```

### updateCGImage(serviceId, path, coordinates?, x?, y?, options?)

Updates the Custom Graphics background to an image with the specified path on the camera.
If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `path` (`string`): Path to the image.
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`): Position of the image.
    -   `x` (`number`, optional, default = `0`): Offset of the image on X axis.
    -   `y` (`number`, optional, default = `0`): Offset of the image on Y axis.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImage(4, path, 'bottom_right');
```

### updateCGImageFromData(serviceId, imageType, imageData, coordinates?, x?, y?, options?)

Updates the Custom Graphics background to an image passed as
the imageData argument. If no coordinates are specified, the service will use the positioning from the last update.

-   **Parameters:**
    -   `serviceId` (`number`): Id of the service.
    -   `imageType` ([`ImageType`](#types-1)): jpeg or png.
    -   `imageData` (`Parameters<Client['post']>[0]['data']`): Image data (e.g. Blob, ArrayBuffer)
    -   `coordinates` ([`TCoordinates`](#types-1), optional, default = `''`): Position of the image.
    -   `x` (`number`, optional, default = `0`): Offset of the image on X axis.
    -   `y` (`number`, optional, default = `0`): Offset of the image on Y axis
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await coApi.updateCGImageFromData(9, 'PNG', data, 'bottom', 0, 0);
```

<br/>

## Report Methods

### downloadReport(options?)

Get application report data.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await coApi.downloadReport();
```
