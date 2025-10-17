# Clients

Every Api will now use client to comunicate with camera. Use default client (exported by out library) or you can implment your own one.

## Default clients

-   DefaultClient - for http requests
-   WsEventClient - for websockets

There are two implementations for nodejs and for web.

### Nodejs

For nodejs we are using undicii (pure nodejs) library to be able use keep-alive ... use one tls connection for multiple requests, browsers have this natively supported

```js
import { DefaultClient, WsEventClient } from 'camstreamerlib/node';

const client = new DefaultClient({
    tls: false,
    tlsInsecure: false,
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
});
```

### Web

```js
import { DefaultClient, WsEventClient } from 'camstreamerlib/web';

const client = new DefaultClient();
```

## Custom client

Api expects to use native fetch (web or nodejs), just implement the interface imported from

```js
import { IClient, IWebsocket } from 'camstreamerlib';
```
