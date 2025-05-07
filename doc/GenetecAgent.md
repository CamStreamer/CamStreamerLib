# GenetecAgent

Module for receiving and sending data to Genetec VMS.

## Methods

-   **GenetecAgent(options)** - The options parameter contains access details for the camera and Genetec account.
    Values mentioned in the example below are default.

        ```javascript
        GenetecAgent({
            protocol: 'http',
            ip : '127.0.0.1',
            port : 80,
            user : 'root',
            pass : '',
            app_id :'',
            base_uri :'WebSdk',
        });
        ```

-   **checkConnection()** - Check connection to Genetec.

    ```javascript
    checkConnection();
    ```

-   **getAllCameraGuids()** - Get all the available cameras guids.

    ```javascript
    getAllCameraGuids();
    ```

-   **getCameraDetails(guids, parameters)** - Get details specified in the parameters for one or more cameras.

    ```javascript
    getCameraDetails([{ Guid: '00000001-0000-babe-0000-b8a44f0984531545' }], ['Guid', 'Name', 'EntityType']);
    ```

-   **sendBookmark(guids, bookmarkText)** - Add Genetec bookmark to one or more cameras.

    ```javascript
    sendBookmark([{ Guid: '00000001-0000-babe-0000-b8a44f0984531545' }], 'bookmark text');
    ```
