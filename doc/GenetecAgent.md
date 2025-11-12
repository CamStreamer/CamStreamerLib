# GenetecAgent

Module for receiving and sending data to Genetec VMS.

## Constructor

-   **new GenetecAgent(options)**

> [!NOTE]
> the `options` parameter contains access details of your target Genetec account. Values mentioned in the example below are default.

```typescript
const agent = new GenetecAgent({
    protocol: 'http',
    ip: '127.0.0.1',
    port: 80,
    user: '',
    pass: '',
    appId: '',
    baseUri: 'WebSdk',
    timeout: 10000,
});
```

```typescript
type GenetecAgentOptions = {
    protocol?: 'http' | 'https' | 'https_insecure';
    ip?: string;
    port?: number;
    baseUri?: string;
    user?: string;
    pass?: string;
    appId?: string;
    timeout?: number;
};
```

## Methods

### checkConnection()

Check connection to Genetec.

-   **Returns:** `Promise<void>`

```javascript
await agent.checkConnection();
```

### getAllCameraGuids()

Get all the available cameras guids.

-   **Returns:** `Promise<TCameraGuidsResponse>`

```typescript
type TCameraGuidsResponse = {
    Rsp: {
        Status: 'Ok';
        Result: {
            Guid: string;
        }[];
    };
};
```

```javascript
const guids = await agent.getAllCameraGuids();
```

### getCameraDetails(guids, parameters)

Get details specified in the parameters for one or more cameras.

-   **Parameters:**
    -   `guids` (`{ Guid: string }[]`)
    -   `parameters` (`("Guid" | "Name" | "EntityType")[]`)
-   **Returns:** `Promise<TCameraDetail>`

```typescript
type TCameraDetail = {
    Guid: string | undefined;
    Name: string | undefined;
    EntityType: string | undefined;
};
```

```javascript
const details = await agent.getCameraDetails(
    [{ Guid: '00000001-0000-babe-0000-b8a44f0984531545' }],
    ['Guid', 'Name', 'EntityType']
);
```

### sendBookmark(guids, bookmarkText)

Add Genetec bookmark with a timestamp to one or more cameras.

-   **Parameters:**
    -   `guids` (`string[]`)
    -   `bookMarkText` (`string`)
-   **Returns:** `Promise<void>`

```javascript
await agent.sendBookmark([{ Guid: '00000001-0000-babe-0000-b8a44f0984531545' }], 'hello camera');
```
