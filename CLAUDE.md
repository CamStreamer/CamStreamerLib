# CLAUDE.md

## Project Overview

CamStreamerLib is a Node.js/TypeScript helper library for CamStreamer ACAP applications running on Axis cameras. It provides APIs for camera control, video overlay drawing, streaming management, and event handling via the VAPIX interface and CamStreamer/CamOverlay services.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run build        # Clean dist/, compile TypeScript, copy package files to dist/
npm run tsc          # TypeScript compilation only
npm run lint         # ESLint check on src/**/*.ts
npm run lint:fix     # ESLint auto-fix
npm run pretty       # Prettier format src, doc, README
npm run pretty:check # Prettier check (used in CI)
npm run test         # Run Jest tests (uses --experimental-vm-modules)
```

CI runs: build -> test -> lint -> pretty:check (on push/PR to master).

## Architecture

### HTTP Client Pattern (IClient)

Most API classes (`CameraVapix`, `CamOverlayAPI`, `CamStreamerAPI`, `CamSwitcherAPI`) follow the same constructor pattern: they accept either an options object (`HttpOptions`) or an `IClient` interface. When given options, they create a `DefaultAgent` internally. The `IClient` interface (`src/internal/common.ts`) defines `get` and `post` methods returning `Promise<Response>`, enabling dependency injection for testing or custom HTTP clients.

### WebSocket Client Pattern

`CamOverlayDrawingAPI` and event modules (`VapixEvents`, `CamSwitcherEvents`) use `WsClient` (`src/internal/WsClient.ts`) for WebSocket connections. `WsClient` handles digest authentication on 401 responses and automatic reconnection with a 10-second delay. These classes extend `EventEmitter` and emit `open`, `close`, `error`, and `message` events.

### Key Module Categories

- **HTTP API wrappers**: `CameraVapix` (VAPIX camera control), `CamOverlayAPI` (overlay service management), `CamStreamerAPI` (stream management), `CamSwitcherAPI` (video source switching)
- **WebSocket-based**: `CamOverlayDrawingAPI` (cairo drawing commands over WS), `VapixEvents` (camera event subscriptions), `CamSwitcherEvents` (switcher events)
- **Event agents**: `CamScripterAPICameraEventsGenerator` (generates Axis camera events), `GenetecAgent`, `AxisCameraStationEvents` (VMS integrations)
- **Overlay helpers**: `CamOverlayPainter/` (Frame, Painter, ResourceManager) - higher-level abstraction over `CamOverlayDrawingAPI`
- **Internal**: `DefaultAgent` (HTTP client with digest auth via `HttpRequestSender`), `WsClient`, `Digest` (HTTP digest authentication)

### Connection Defaults

All modules default to `127.0.0.1` (localhost) since the library is designed to run on the Axis camera itself. TLS defaults to off; when TLS is on, port defaults to 443, otherwise 80.

## Code Style

- Uses `@camstreamer/eslint-config` and `@camstreamer/prettier-config`
- TypeScript strict mode, target ES6, CommonJS modules
- Node.js >= 18 required
- Tests use Jest with ts-jest preset; test files match `**/*.test.ts`

## Publishing

Build outputs to `dist/`. Publish with `npm publish ./dist` after tagging a version.
