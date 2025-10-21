# Clients

Every Api will now use client to comunicate with camera. Use default client (exported by out library) or you can implment your own one.

## Default clients

-   DefaultClient - for http requests
-   WsEventClient - for websockets

There are two implementations for nodejs and for web.

### Nodejs

For nodejs we are using undicii (pure nodejs) library to be able use keep-alive ... use one tls connection for multiple requests, browsers have this natively supported

```js
import { DefaultClient, WsClient } from 'camstreamerlib/node';

const client = new DefaultClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
});

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

### Web

```js
import { DefaultClient, WsClient } from 'camstreamerlib/web';
import { CamSwitcherAPI } from 'camstreamerlib';

const client = new DefaultClient();

const createWsEventsUrl = () => {
    const path = CamSwitcherAPI.getWsEventsUrlPath();
    const url = new URL(path, window.location.href);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
};
const wsClient = new WsClient(createWsEventsUrl);
```

## Custom client

Api expects to use native fetch (web or nodejs), just implement the interface imported from

```js
import { IClient, IWsClient } from 'camstreamerlib';
```
