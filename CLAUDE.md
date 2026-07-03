# CLAUDE.md

## Project Overview

CamStreamerLib is a Node.js/TypeScript helper library for CamStreamer ACAP applications running on Axis cameras. It provides APIs for ACAP applications.

## Build & Development Commands

```bash
npm install             # Install dependencies
npm run build           # Clean dist/, compile CJS + ESM TypeScript, copy package files to dist/
npm run lint            # ESLint check on src/**/*.ts
npm run pretty:check    # Prettier check (used in CI)
npm run test            # Run Jest tests (uses --experimental-vm-modules)
npm run publishPackage  # Publish via ./publish.sh
```

CI runs: build -> test -> lint -> pretty:check (on push/PR to master).

## Architecture

### Entry Points & Layering (isomorphic core)

The library ships **three entry points**, mirrored in `package.json` `exports`, enforcing a strict node/browser split:

| Entry point            | Source layer                                                                                         | Runs in                 | May use                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| `camstreamerlib` (`.`) | root API classes (`CamOverlayAPI.ts`, `VapixAPI.ts`, …), `internal/`, `types/`, `errors/`            | **both** node + browser | only isomorphic code + the injected `IClient`                         |
| `camstreamerlib/node`  | `src/node/` (`HttpServer`, `TimeZoneDaemon`, `DefaultClient`, `WsClient`, `Digest`, agents, painter) | node only               | node built-ins (`http`, `fs`, `crypto`, `ws`, `Buffer`, `process`, …) |
| `camstreamerlib/web`   | `src/web/` (`DefaultClient`, `WsClient`)                                                             | browser only            | browser globals (`fetch`, `WebSocket`, `window`, …)                   |

The shared core stays isomorphic by never doing I/O directly: it goes through the injected `IClient` (transport implemented per-environment in `node/DefaultClient` vs `web/DefaultClient`). A shared-core file must **not** import from `../node/`/`../web/` or use any env-specific global/built-in. `node/` code lives in subdirs — `src/node/events/` (VMS/event agents) and `src/node/CamOverlayPainter/` (`Frame`, `Painter`, `ResourceManager`).

### HTTP Client Pattern (IClient)

Most API classes (`VapixAPI`, `CamOverlayAPI`, `CamStreamerAPI`, `CamSwitcherAPI`, `CamScripterAPI`, `PlaneTrackerAPI`) accept an `IClient` instance directly (dependency injection). `IClient<TRes, Data>` (`src/internal/types.ts`) is a generic interface defining `get` and `post` methods. Node.js code uses `DefaultClient` (built on `HttpRequestSender` with digest auth via `undici`); browser code uses `web/DefaultClient` (built on `fetch`). All API classes extend `BasicAPI` which provides common helpers — `_getJson`, `_getText`, `_getBlob` (GET) and `_post`, `_postJsonEncoded`, `_postUrlEncoded` (POST) — and optional proxy support via `ProxyClient`.

### WebSocket Client Pattern

WebSocket-based event classes use `IWsClient` (callback-based interface with `onMessage`, `onOpen`, `onClose`, `onError`, `send`, `reconnect`). Node.js: `WsClient` (`src/node/WsClient.ts`) uses the `ws` package, handles digest auth on 401 responses, ping/keepalive, and automatic reconnection. Browser: `web/WsClient` uses the native `WebSocket` API with a 5-second reconnect timeout.

Event classes in `src/ws/` (`CamOverlayEvents`, `CamStreamerEvents`, `CamSwitcherEvents`, `PlaneTrackerEvents`) and `src/node/VapixEvents.ts` use `WsEvents<T>` (`src/internal/WsEvents.ts`) — a custom typed event system (not `EventEmitter`) that works in both Node.js and browser environments.

### Key Module Categories

## ACAP and Camera API modules

| API                                                | Usage                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [VapixAPI](doc/VapixAPI.md)                        | Access Axis camera VAPIX interface.                                                                    |
| [CamStreamerAPI](doc/CamStreamerAPI.md)            | Control of video streaming in the CamStreamer ACAP application (RTMP, HLS, SRT and MPEG-TS protocols). |
| [CamOverlayAPI](doc/CamOverlayAPI.md)              | Manage CamOverlay overlay widgets and Custom Graphics, plus image/font file management.                |
| [CamScripterAPI](doc/CamScripterAPI.md)            | Manage CamScripter packages and the on-camera Node.js runtime.                                         |
| [CamSwitcherAPI](doc/CamSwitcherAPI.md)            | Switch video sources — manage CamSwitcher streams, clips, and playlists.                               |
| [PlaneTrackerAPI](doc/PlaneTrackerAPI.md)          | Aircraft tracking — manage PlaneTracker calibration, settings, planes/tracking, and map zones.         |
| [CamStreamerEvents](doc/ws/CamStreamerEvents.md)   | Module which allows receiving events from CamStreamer ACAP application.                                |
| [CamOverlayEvents](doc/ws/CamOverlayEvents.md)     | Module which allows receiving events from CamOverlay ACAP application.                                 |
| [CamSwitcherEvents](doc/ws/CamSwitcherEvents.md)   | Module which allows receiving events from CamSwitcher ACAP application.                                |
| [PlaneTrackerEvents](doc/ws/PlaneTrackerEvents.md) | Module which allows receiving events from PlaneTracker ACAP application.                               |

> **Layer:** every module in this table is **shared core** (isomorphic — `src/*.ts`, `src/ws/*.ts`) and exported from the root `camstreamerlib` entry point; changes here must run in both node and browser. Exception: `VapixEvents` is **not** here — it is node-only (see below), even though the other `*Events` classes are shared.

## Node.js modules

> **Layer:** every module in this table is **node-only** (`src/node/`), exported from `camstreamerlib/node`; it may use node built-ins and must never be added to the root `src/index.ts`.

| Module                                                                            | Description                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HttpServer](doc/HttpServer.md)                                                   | Module for processing HTTP requests in your scripts. It also automatically serves up the content from html directory or you can register paths which you can process by your own (e.g. `http://$CAMERA_IP/local/camscripter/proxy/$MY_PACKAGE_NAME/control.cgi`). |
| [VapixEvents](doc/ws/VapixEvents.md)                                              | Module which allows receiving camera events from the VAPIX API.                                                                                                                                                                                                   |
| [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md)                               | Module for easy control of CamOverlay drawing API. For more details on supported video overlay drawing functions see https://camstreamer.com/camoverlay-api1                                                                                                      |
| [CamOverlayPainter](doc/CamOverlayPainter.md)                                     | Contains three modules which makes easier to use CamOverlayDrawingAPI.                                                                                                                                                                                            |
| [CamScripterAPICameraEventsGenerator](doc/CamScripterAPICameraEventsGenerator.md) | Module which allows generating events on an Axis camera. These events can be used for triggers in the Axis camera rule engine (events/actions). It is also an easy way how to integrate events and metadata in VMS systems which support Axis camera events.      |
| [GenetecAgent](doc/GenetecAgent.md)                                               | Module which allows receiving and sending data to Genetec VMS.                                                                                                                                                                                                    |
| MilestoneAgent (`node/events/MilestoneAgent.ts`, undocumented)                    | Module which allows receiving and sending data to Milestone VMS (sibling to GenetecAgent; no `doc/*.md` yet).                                                                                                                                                     |
| AxisCameraStationEvents (`node/events/AxisCameraStationEvents.ts`, undocumented)  | Module for integrating events with Axis Camera Station VMS (no `doc/*.md` yet).                                                                                                                                                                                   |
| [TimeZoneDaemon](doc/TimeZoneDaemon.md)                                           | Module for periodically checking and updating the Node.js process timezone to match the system timezone.                                                                                                                                                          |

### Connection Defaults

All modules default to `127.0.0.1` (localhost) since the library is designed to run on the Axis camera itself. TLS defaults to off; when TLS is on, port defaults to 443, otherwise 80.

### Schema Validation

API response types are validated with `zod` schemas co-located in `src/types/`. Complex services have subdirectories (e.g., `src/types/CamOverlayAPI/`, `src/types/CamStreamerAPI/`).
