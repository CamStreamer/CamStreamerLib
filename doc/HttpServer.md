# HttpServer

HttpServer is a module for processing HTTP requests in your scripts. It also automatically serves up the content from html directory or you can register paths which you can proccess by your own (e.g. http://$CAMERA_IP/local/camscripter/proxy/$MY_PACKAGE_NAME/control.cgi).

## Methods

-   **HttpServer(options)** - Options parameter contains port which the created HttpServer listens on. Values mentioned
    in example below are default.

        ```javascript
        HttpServer({
            port: 80,
        });
        ```

-   **onRequest(path, callback)** - It registers callback for access to specified path. Callback has attributes - request and response.

    ```javascript
    httpServer.onRequest('/settings.cgi', function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end('{"enabled": true}');
    });
    ```

-   **close()** - Closes httpServer service and frees up the occupied port.

## Events

-   **access(msg)** - The Event is emitted for all HTTP requests to this server

-   **error(err)** - An error occured
