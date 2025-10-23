# Clients

Every Api will now use client to comunicate with camera. Use default client (exported by out library) or you can implment your own one.

## Default clients

-   DefaultClient - for http requests (used in API)
-   WsClient - for websockets (used in ws events)

There are two implementations for nodejs and for web.

```ts
type Options = {
    ip?: string; // camera ip address
    port?: number; // camera port
    user?: string; // camera username
    pass?: string; // camera password
    tls?: boolean; // secure (eg. http/https)
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
};

type HttpOptions = Options & {
    keepAlive?: boolean; // enables keep-alihe header => will use one tcp connection for more http requests
};

type WsClientOptions = Options & {
    address: string; // url path to connect ws
    headers?: Record<string, string>;
    pingInterval?: number; // timeout for ping msg (to check if connection is still alive), defualt 30s
    protocol?: string; // protocol used in ws, eg. 'events'
};
```

### Nodejs - DefaultClient

For nodejs we are using undicii (pure nodejs) library to be able use keep-alive ... use one tls connection for multiple requests, browsers have this natively supported

Used for acap app api, eg: CamStreamerAPI, CamOverlayAPI

**new DefaultClient(options: HttpOptions)**

```js
import { DefaultClient } from 'camstreamerlib/node';

const client = new DefaultClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: 'root',
    pass: 'pass',
});
```

### Nodejs - WsClient

Used for websocket events, eg: CamStreamerEvents, CamSwitcherEvents

**new WsClient(options: WsClientOptions)**

```js
import { WsClient } from 'camstreamerlib/node';

const wsClient = new WsClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
    address: '',
});
```

### Web - DefaultClient

Used for acap app api, eg: CamStreamerAPI, CamOverlayAPI

**new DefaultClient(domain?: string)**

```js
import { DefaultClient } from 'camstreamerlib/web';

const client = new DefaultClient();
```

defaultly the requests are done to orgin (eg. `/path-to-cgi`)
in constructor you can specifiy domain (eg. `http://111.111.111.111:5000` to do requests to `http://111.111.111.111:5000/path-to-cgi`)

### Web - WsClient

Used for websocket events, eg: CamStreamerEvents, CamSwitcherEvents

**new WsClient(getUrl: () => string)**

```js
import { WsClient } from 'camstreamerlib/web';
import { CamSwitcherAPI } from 'camstreamerlib';

const createWsEventsUrl = () => {
    const path = CamSwitcherAPI.getWsEventsUrlPath();
    const url = new URL(path, window.location.href);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
};
const wsClient = new WsClient(createWsEventsUrl);
```

## Custom client

Api expects to use native fetch (web or nodejs), just implement the interface imported from and use it

```js
import { IClient, IWsClient } from 'camstreamerlib';
```
