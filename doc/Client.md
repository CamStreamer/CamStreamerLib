# Clients

Every Api will now use client to comunicate with camera. Use default client (exported by out library) or you can implment your own one.

## Default clients

-   <b>DefaultClient</b> - for http requests (used in API)
-   <b>WsClient</b> - for websockets (used in ws events)
-   <b>DeviceConnectClient</b> - for http requests to a camera connected via Device Connect (drop-in replacement of `DefaultClient` in API)
-   <b>DeviceConnectWsClient</b> - for websockets to a camera connected via Device Connect (drop-in replacement of `WsClient` in ws events)

There are two implementations for nodejs and for web.

```ts
type Options = {
    host?: string; // camera ip address or domain
    port?: number; // camera port
    user?: string; // camera username
    pass?: string; // camera password
    tls?: boolean; // secure (eg. http/https)
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    headers?: Record<string, string>; // headers added to every request
};

type HttpOptions = Options & {
    keepAlive?: boolean; // enables keep-alihe header => will use one tcp connection for more http requests
};

type DeviceConnectOptions = {
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    keepAlive?: boolean; // enables keep-alive header => will use one tcp connection for more http requests
};

type WsClientOptions = Options & {
    address: string; // url path to connect ws
    pingInterval?: number; // timeout for ping msg (to check if connection is still alive), defualt 30s
    protocol?: string; // protocol used in ws, eg. 'events'
};

type DeviceConnectWsClientOptions = {
    path: string; // url path to connect ws
    headers?: Record<string, string>;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    pingInterval?: number; // timeout for ping msg (to check if connection is still alive), defualt 30s
    protocol?: string; // protocol used in ws, eg. 'events'
};
```

<br/>

## Nodejs

### Nodejs - DefaultClient

For nodejs we are using `undici` (pure nodejs) library to be able use `keep-alive` ... use one tls connection for multiple requests, browsers have this natively supported.

Used for ACAP app API, e.g.: CamStreamerAPI, CamOverlayAPI

**new DefaultClient(options: HttpOptions)**

```js
import { DefaultClient } from 'camstreamerlib/node';

const client = new DefaultClient({
    tls: false,
    tlsInsecure: false,
    host: '127.0.0.1',
    port: 80,
    user: 'root',
    pass: 'pass',
});
```

### Nodejs - DeviceConnectClient

Used instead of `DefaultClient` when the camera has no public IP and is reachable through the Device Connect proxy. Every connected device is available at `https://<MAC_ADDRESS>.device-connect.net` (`.biz` for testing, `.dev` for development).

The proxy handles the authentication to the camera itself, so no camera `user`/`pass` is needed - the client only authenticates to Device Connect with a device access token, sent as an `authorization: Token <deviceAccessToken>` header on every request. Connection is always `https` on port 443.

**new DeviceConnectClient(deviceAccessToken: string, host: string, opt?: DeviceConnectOptions)**

```js
import { DeviceConnectClient } from 'camstreamerlib/node';
import { CamStreamerAPI } from 'camstreamerlib';

const client = new DeviceConnectClient('device-access-token', 'ACCC8EA84F71.device-connect.net', {
    tlsInsecure: false,
    keepAlive: true,
});
const camStreamerAPI = new CamStreamerAPI(client);
```

### Nodejs - WsClient

Used for websocket events, eg: CamStreamerEvents, CamSwitcherEvents

**new WsClient(options: WsClientOptions)**

```js
import { WsClient } from 'camstreamerlib/node';

const wsClient = new WsClient({
    tls: false,
    tlsInsecure: false,
    host: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
    address: '',
});
```

### Nodejs - DeviceConnectWsClient

Used instead of `WsClient` for a camera reachable through the Device Connect proxy. The connection is always `wss` on port 443 to `<host>`.

**new DeviceConnectWsClient(deviceAccessToken: string, host: string, opt: DeviceConnectWsClientOptions)**

```js
import { DeviceConnectWsClient } from 'camstreamerlib/node';
import { CamSwitcherEvents, CamSwitcherAPI } from 'camstreamerlib';

const wsClient = new DeviceConnectWsClient('device-access-token', 'ACCC8EA84F71.device-connect.net', {
    path: CamSwitcherAPI.getWsEventsPath(),
    protocol: 'events',
    tlsInsecure: false,
});
const cswEvents = new CamSwitcherEvents(wsClient, () => cswApi.wsAuthorization());
```

<br/>

## Web

### Web - DefaultClient

Used for acap app api, eg: CamStreamerAPI, CamOverlayAPI

**new DefaultClient(domain?: string, headers?: Record\<string, string\>)**

```js
import { DefaultClient } from 'camstreamerlib/web';

const client = new DefaultClient();
```

defaultly the requests are done to orgin (eg. `/path-to-cgi`)
in constructor you can specifiy domain (eg. `http://111.111.111.111:5000` to do requests to `http://111.111.111.111:5000/path-to-cgi`)

the optional `headers` are added to every request; per-request headers with the same name override them

### Web - DeviceConnectClient

Used instead of `DefaultClient` when the browser talks to a camera through the Device Connect proxy instead of the origin.

**new DeviceConnectClient(deviceAccessToken: string, host: string)**

```js
import { DeviceConnectClient } from 'camstreamerlib/web';
import { CamStreamerAPI } from 'camstreamerlib';

const client = new DeviceConnectClient('device-access-token', 'ACCC8EA84F71.device-connect.net');
const camStreamerAPI = new CamStreamerAPI(client);
```

### Web - WsClient

Used for websocket events, eg: CamStreamerEvents, CamSwitcherEvents

**new WsClient(getUrl: () => string)**

```js
import { WsClient } from 'camstreamerlib/web';
import { CamSwitcherAPI } from 'camstreamerlib';

const createWsEventsUrl = () => {
    const path = CamSwitcherAPI.getWsEventsPath();
    const url = new URL(path, window.location.href);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
};
const wsClient = new WsClient(createWsEventsUrl);
```

### Web - DeviceConnectWsClient

Used instead of `WsClient` when the browser connects to a camera through the Device Connect proxy.
The path is passed as a getter, so it is evaluated on every (re)connect - the same way as `getUrl` in `WsClient`.

**new DeviceConnectWsClient(deviceAccessToken: string, host: string, getPath: () => string)**

```js
import { DeviceConnectWsClient } from 'camstreamerlib/web';
import { CamSwitcherEvents, CamSwitcherAPI } from 'camstreamerlib';

const wsClient = new DeviceConnectWsClient('device-access-token', 'ACCC8EA84F71.device-connect.net', () =>
    CamSwitcherAPI.getWsEventsPath()
);
const cswEvents = new CamSwitcherEvents(wsClient, () => cswApi.wsAuthorization());
```

<br/>

## Custom client

Api expects to use native fetch (web or nodejs), just implement the interface imported from and use it

```js
import { IClient, IWsClient } from 'camstreamerlib';
```
