# CamScripterAPI

Module for access to the CamScripter HTTP interface.

## Constructor

-   **new CamScripterAPI(client)** - Look at the [Client](./Client.md) docs.

```javascript
import { DefaultClient } from 'camstreamerlib/web';
import { CamScripterAPI } from 'camstreamerlib';

const cscApi = new CamScripterAPI(new DefaultClient());
```

> [!TIP]
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

### getProxyPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const path = CamScripterAPI.getProxyPath();
```

## Methods - Common

### getClient(proxyParams?)

Returns CamScripter client - can be used in custom CamScripter API calls.

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
const client = cscApi.getClient();
```

### checkAPIAvailable(options?)

Dummy endpoint to check if API is available.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.checkAPIAvailable();
```

### checkCameraTime(options?)

Check camera time against CamStreamer server.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await cscApi.checkCameraTime();
```

### getNetworkCameraList(options?)

Find cameras on local network using mDNS protocol.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
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
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TCameraStorage>`

    ```typescript
    type TCameraStorage =
        | [
              {
                  type: 'FLASH';
                  capacity_mb: number;
              },
              {
                  type: 'SD_DISK';
                  capacity_mb: number;
              }
          ]
        | [
              {
                  type: 'FLASH';
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
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<TPackageInfoList>`

    ```typescript
    type TPackageInfoList = {
        storage: 'FLASH' | 'SD_DISK';
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
    -   `formData` (`Parameters<Client['post']>[0]['data']`)
    -   `storage`: (`'FLASH'` | `'SD_DISK'`): Where to install the pacakge.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.installPackages(data, 'SD_DISK');
```

### uninstallPackage(packageId, options?)

Remove package.

-   **Parameters:**
    -   `packageId` (`string`): Name of the package.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.uninstallPackage('video_checkpoint');
```

### importSettings(packageId, formData, options?)

Imports package settings.

-   **Parameters:**
    -   `packageId` (`string`): Name of the package
    -   `formData` (`Parameters<Client['post']>[0]['data']`): Package data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.importSettings('video_checkpoint', data);
```

### exportSettings(packageId, formData, options?)

Exports package settings.

-   **Parameters:**
    -   `packageId` (`string`): Name of the package.
    -   `formData` (`Parameters<Client['post']>[0]['data']`): Package settings data.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.exportSettings('video_checkpoint', data);
```

## Methods - Node.js

### getNodejsStatus(options?)

Return diagnostics information.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
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
    -   `storage`: (`'FLASH'` | `'SD_DISK'`): Where to install NodeJS.
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<void>`

```javascript
await cscApi.installNodejs('FLASH');
```

### Methods - Report

### downloadReport(options?)

Get application report data.

-   **Parameters:**
    -   `options` (`THttpRequestOptions`, optional)
-   **Returns:** `Promise<string>`

```javascript
await cscApi.downloadReport();
```
