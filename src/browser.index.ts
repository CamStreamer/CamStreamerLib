// Entry point for the browser bundle (examples/camstreamerlib.js).
// Merges the isomorphic root entry point with the browser-only clients, so an example
// page can import everything from a single <script type="module">.
export * from './index';
export * from './web/index';
