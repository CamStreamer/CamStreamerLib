# Examples

Standalone browser examples that use CamStreamerLib directly from a `<script type="module">`,
without a bundler or a framework.

## Build the browser bundle

```bash
npm install
npm run build:browser
```

## Run

Modules can't be loaded over `file://`, so serve the folder over HTTP:

```bash
npx serve examples
```

Both pages connect to a camera through the Device Connect proxy. Fill in the device host
(`<MAC_ADDRESS>.device-connect.net`) and the device access token in the form, or hardcode them in the
`DEVICE_HOST` / `DEVICE_ACCESS_TOKEN` constants at the top of the page's script to have the form
prefilled. See [doc/Client.md](../doc/Client.md).

## camswitcher-events.html

Logs every CamSwitcher event. `DeviceConnectClient` (HTTP) backs `CamSwitcherAPI` to obtain the
websocket authorization token; `DeviceConnectWsClient` (websocket) backs `CamSwitcherEvents`, which
validates and dispatches the events. Connection state is taken from the `authorization` event.

See [doc/ws/CamSwitcherEvents.md](../doc/ws/CamSwitcherEvents.md).

## planetracker-events.html

Logs every PlaneTracker event. PlaneTracker needs no authorization token — `PlaneTrackerEvents`
announces the connecting user (`userId` / `userName` / `userPriority`, editable in the form) as the
init message instead, so only the websocket client is needed.

`CAMERA_POSITION` and `FLIGHT_LIST` arrive continuously, so by default they only update the summary
line above the log; tick the checkbox to log them as well.

See [doc/ws/PlaneTrackerEvents.md](../doc/ws/PlaneTrackerEvents.md).
