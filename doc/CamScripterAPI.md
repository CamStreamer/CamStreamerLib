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

## Static

### getProxyUrlPath()

Returns relative path to proxy.cgi

-   **Returns:** `string`

```javascript
const url = CamScripterAPI.getProxyUrlPath();
```

## Methods common

### checkCameraTime()

Check camera time against CamStreamer server.

-   **Returns:** `Promise<boolean>`

```javascript
const isValid = await cscApi.checkCameraTime();
```

### getNetworkCameraList()

Find cameras on local network using mDNS protocol.

-   **Returns:**
    ```
    Promise<Array<{
        name: string;
        ip: string;
    }>>
    ```

```javascript
const list = await cscApi.getNetworkCameraList();
```

## Methods packages

### getStorageInfo()

Get available storage and it's capacity in MB.

-   **Returns:**
    ```
    Promise<Array<{
        type: "INTERNAL" | "SD_CARD";
        capacity_mb: number;
    }>>
    ```

```javascript
const storage = await cscApi.getStorageInfo();
```

### getPackageList()

List all installed packages.

-   **Returns:**
    ```
    Promise<Array<{
        storage: "INTERNAL" | "SD_CARD";
        manifest: {
        package_name: string;
        package_menu_name: string;
        package_version: string;
        vendor: string;
        ui_link: string;
        required_camscripter_version?: string | undefined;
        required_camscripter_rbi_version?: string | undefined;
        };
    }>>
    ```

```javascript
const packages = await cscApi.getPackageList();
```

### installPackages(formData, storage)

Install package.

-   **Parameters:**
    -   `formData` (FormData)
    -   `storage`: (`INTERNAL | SD_CARD`)
-   **Returns:**
    ```
    Promise<{
        message: string;
        status: number;
    }>
    ```

```javascript
await cscApi.installPackages(data, 'SD_CARD');
```

### uninstallPackage(packageId)

Remove package.

-   **Parameters:**
    -   `packageId` (string)
-   **Returns:**
    ```
    Promise<{
        message: string;
        status: number;
    }>
    ```

```javascript
await cscApi.uninstallPackage(id);
```

### importSettings(packageId, formData)

Imports package settings.

-   **Parameters:**
    -   `packageId` (string)
    -   `formData` (FormData)
-   **Returns:**
    ```
    Promise<{
        message: string;
        status: number;
    }>
    ```

```javascript
await cscApi.importSettings(id, data);
```

### exportSettings(packageId, formData)

Exports package settings.

-   **Parameters:**
    -   `packageId` (string)
    -   `formData` (FormData)
-   **Returns:**
    ```
    Promise<{
        message: string;
        status: number;
    }>
    ```

```javascript
await cscApi.exportSettings(id, data);
```

## Methods Nodejs

### getNodejsStatus()

Return diagnostics information.

-   **Returns:**
    ```
    Promise<{
        node_state: "OK" | "NOT_INSTALLED" | "NOT_FOUND";
    }>
    ```
-   **node_state:**
    -   `OK` - NodeJS is installed and ready to use
    -   `NOT_INSTALLED` - NodeJS is not installed
    -   `NOT_FOUND` - NodeJS is missing (probably corrupted installation)

```javascript
const status = await cscApi.getNodejsStatus();
```

### installNodejs(storage)

Decompress bundled NodeJS gzip file into chosen location, which is then stored in NodejsLocation parameter.

-   **Parameters:**
    -   `storage`: (`INTERNAL | SD_CARD`)
-   **Returns:**
    ```
    Promise<{
        message: string;
        status: number;
    }>
    ```

```javascript
await cscApi.installNodejs('INTERNAL');
```
