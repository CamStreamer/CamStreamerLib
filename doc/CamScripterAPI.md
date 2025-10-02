# CamScripterAPI

Module for access to the CamScripter HTTP interface.

## Constructor

-   **new CamScripterAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/esm/node';
import { CamScripterAPI } from 'camstreamerlib/esm';

const cscApi = new CamScripterAPI(
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

> [!NOTE]
> The majority of CamScripterAPI methods accept optional `options` parameter of type `THttpRequestOptions`:

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

## Static

### getProxyUrlPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const url = CamScripterAPI.getProxyUrlPath();
```

## Methods - Common

### checkCameraTime(options?)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await cscApi.checkCameraTime();
```

### getNetworkCameraList(options?)

Find cameras on local network using mDNS protocol.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TNetworkCamera[]>`

    ```typescript
    type TNetworkCamera = {
        name: string;
        ip: string;
    };
    ```

```javascript
const list = await cscApi.getNetworkCameraList();
```

## Methods - Packages

### getStorageInfo(options?)

Get available storage and it's capacity in MB.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TStorage>`

    ```typescript
    type TStorage =
        | [
              {
                  type: 'INTERNAL';
                  capacity_mb: number;
              },
              {
                  type: 'SD_CARD';
                  capacity_mb: number;
              }
          ]
        | [
              {
                  type: 'INTERNAL';
                  capacity_mb: number;
              }
          ];
    ```

```javascript
const storage = await cscApi.getStorageInfo();
```

### getPackageList(options?)

List all installed packages.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TPackageInfoList>`

    ```typescript
    type TPackageInfoList = {
        storage: 'INTERNAL' | 'SD_CARD';
        manifest: {
            package_name: string;
            package_menu_name: string;
            package_version: string;
            vendor: string;
            ui_link: string;
            required_camscripter_version: string | undefined;
            required_camscripter_rbi_version: string | undefined;
        };
    }[];
    ```

```javascript
const packages = await cscApi.getPackageList();
```

### installPackages(formData, storage, options?)

Install package.

-   **Parameters:**
    -   `formData` (FormData)
    -   `storage`: (`'INTERNAL'` | `'SD_CARD'`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCamscripterApiResponse>`

    ```typescript
    type TCamscripterApiResponse = {
        status: number;
        message: string;
    };
    ```

```javascript
await cscApi.installPackages(data, 'SD_CARD');
```

### uninstallPackage(packageId, options?)

Remove package.

-   **Parameters:**
    -   `packageId` (string)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCamscripterApiResponse>`

```javascript
await cscApi.uninstallPackage(id);
```

### importSettings(packageId, formData, options?)

Imports package settings.

-   **Parameters:**
    -   `packageId` (string)
    -   `formData` (FormData)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCamscripterApiResponse>`

```javascript
await cscApi.importSettings(id, data);
```

### exportSettings(packageId, formData, options?)

Exports package settings.

-   **Parameters:**
    -   `packageId` (string)
    -   `formData` (FormData)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCamscripterApiResponse>`

```javascript
await cscApi.exportSettings(id, data);
```

## Methods - Node.js

### getNodejsStatus(options?)

Return diagnostics information.

-   **Parameters:**
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TNodeState>`

    ```typescript
    type TNodeState = {
        node_state: 'OK' | 'NOT_INSTALLED' | 'NOT_FOUND';
    };
    ```

-   **node_state:**
    -   `OK` - NodeJS is installed and ready to use
    -   `NOT_INSTALLED` - NodeJS is not installed
    -   `NOT_FOUND` - NodeJS is missing (probably corrupted installation)

```javascript
const status = await cscApi.getNodejsStatus();
```

### installNodejs(storage, options?)

Decompress bundled NodeJS gzip file into chosen location, which is then stored in NodejsLocation parameter.

-   **Parameters:**
    -   `storage`: (`'INTERNAL'` | `'SD_CARD'`)
    -   `options` (`THttpRequestOptions` | undefined)
-   **Returns:** `Promise<TCamscripterApiResponse>`

```javascript
await cscApi.installNodejs('INTERNAL');
```
