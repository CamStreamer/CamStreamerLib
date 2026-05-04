# HttpServer

- HttpServer is a module for processing HTTP requests in your scripts.
- It also automatically serves up the content from the html directory, or you can register paths which you can process on your own (e.g. `http://$CAMERA_IP/local/camscripter/proxy/$MY_PACKAGE_NAME/control.cgi`).

## Constructor

-   **new HttpServer(options)**

```javascript
import { HttpServer } from 'camstreamerlib/esm/node';

const httpServer = new HttpServer({ port: 80 });
```
> [!NOTE]
> The `options` parameter contains the port which the created HttpServer listens on. Values mentioned in the example are default.

## Methods

### onRequest(path, callback)

It registers a callback for access to the specified path. The callback has attributes - request and response.

-   **Parameters:**
    -   `path` (`string`)
    -   `callback` ((req: `http.IncomingMessage`, res: `http.ServerResponse`) => void)

```javascript
httpServer.onRequest('/settings.cgi', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('{"enabled": true}');
});
```

### close()

Closes the httpServer service and frees up the occupied port.

```javascript
httpServer.close();
```

## Events

-   **access(msg)** - The event is emitted for all HTTP requests to this server.

-   **error(err)** - An error occurred.
