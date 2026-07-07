# CLAUDE.md

## Project Overview

CamStreamerLib is a Node.js/TypeScript helper library for CamStreamer ACAP applications on Axis cameras: camera control, video overlay drawing, streaming management, and event handling via VAPIX and CamStreamer/CamOverlay services.

## Build & Development Commands

```bash
npm install             # Install dependencies
npm run build           # Clean dist/, compile CJS + ESM, copy package files
npm run lint            # ESLint check (lint:fix to auto-fix)
npm run pretty:check    # Prettier check (pretty to format) — used in CI
npm run test            # Jest (uses --experimental-vm-modules)
npm run publishPackage  # Publish via ./publish.sh
```

CI runs: build → test → lint → pretty:check (on push/PR to master).

## Architecture

### Entry Points & Layering (isomorphic core)

Three entry points, mirrored in `package.json` `exports`, enforce a strict node/browser split:

| Entry point            | Source                                                     | Runs in        | May use                                   |
| ---------------------- | ---------------------------------------------------------- | -------------- | ----------------------------------------- |
| `camstreamerlib` (`.`) | root API classes, `internal/`, `types/`, `errors/`         | node + browser | isomorphic code + injected `IClient` only |
| `camstreamerlib/node`  | `src/node/` (`HttpServer`, `WsClient`, agents, painter, …) | node only      | node built-ins (`http`, `fs`, `ws`, …)    |
| `camstreamerlib/web`   | `src/web/` (`DefaultClient`, `WsClient`)                   | browser only   | browser globals (`fetch`, `WebSocket`, …) |

Shared core never does I/O directly — it goes through the injected `IClient` (transport per-environment: `node/DefaultClient` vs `web/DefaultClient`). A shared-core file must **not** import from `../node/`/`../web/` or use env-specific globals. `node/` subdirs: `events/` (VMS/event agents), `CamOverlayPainter/` (`Frame`, `Painter`, `ResourceManager`).

### Client & WebSocket Patterns

-   **`IClient` injection**: API classes accept `HttpOptions` (→ builds `DefaultClient` internally) or an `IClient` (used as-is — the seam for tests/custom transports). `IClient` = `get`/`post` returning `Promise<Response>`.
-   **`WsClient`** (backs `CamOverlayDrawingAPI` + WS event modules): digest auth on `401`, auto-reconnect (~10s). Extends `EventEmitter`; emits `open`/`close`/`error`/`message`.

### Modules

**Shared core** (isomorphic — `src/*.ts`, `src/ws/*.ts`), exported from root `camstreamerlib`; must run in both node + browser:

| Module                                                                                               | Purpose                                                |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [VapixAPI](doc/VapixAPI.md)                                                                          | Axis camera VAPIX interface.                           |
| [CamStreamerAPI](doc/CamStreamerAPI.md)                                                              | Video streaming control (RTMP, HLS, SRT, MPEG-TS).     |
| [CamOverlayAPI](doc/CamOverlayAPI.md)                                                                | CamOverlay widgets, Custom Graphics, image/font files. |
| [CamScripterAPI](doc/CamScripterAPI.md)                                                              | CamScripter packages + on-camera Node.js runtime.      |
| [CamSwitcherAPI](doc/CamSwitcherAPI.md)                                                              | Switch sources — streams, clips, playlists.            |
| [PlaneTrackerAPI](doc/PlaneTrackerAPI.md)                                                            | Aircraft tracking — calibration, planes, map zones.    |
| [Cam{Streamer,Overlay,Switcher}Events](doc/ws/) · [PlaneTrackerEvents](doc/ws/PlaneTrackerEvents.md) | Receive events from the respective ACAP.               |

> Exception: `VapixEvents` is **node-only** (below), unlike the other `*Events` classes.

**Node-only** (`src/node/`), exported from `camstreamerlib/node`; may use node built-ins, never added to root `src/index.ts`:

| Module                                                                            | Purpose                                                           |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [HttpServer](doc/HttpServer.md)                                                   | Serve HTTP requests / static `html`, register custom CGI paths.   |
| [VapixEvents](doc/ws/VapixEvents.md)                                              | Receive camera events from VAPIX.                                 |
| [CamOverlayDrawingAPI](doc/CamOverlayDrawingAPI.md)                               | Low-level CamOverlay drawing API.                                 |
| [CamOverlayPainter](doc/CamOverlayPainter.md)                                     | Higher-level helpers over CamOverlayDrawingAPI.                   |
| [CamScripterAPICameraEventsGenerator](doc/CamScripterAPICameraEventsGenerator.md) | Generate Axis camera events (triggers, VMS integration).          |
| [GenetecAgent](doc/GenetecAgent.md)                                               | Genetec VMS integration.                                          |
| MilestoneAgent · AxisCameraStationEvents                                          | VMS integrations in `node/events/` (undocumented, no `doc/*.md`). |
| [TimeZoneDaemon](doc/TimeZoneDaemon.md)                                           | Periodically sync Node.js process timezone to the system.         |

### Connection & Validation

-   **Defaults**: `127.0.0.1` (library runs on the camera). TLS off by default; when on, port 443, else 80.
-   **Schema validation**: `zod` schemas co-located in `src/types/`; complex services get subdirs (e.g. `src/types/CamOverlayAPI/`).
