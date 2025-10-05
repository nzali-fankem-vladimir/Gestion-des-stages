// Polyfills to make certain Node globals available in the browser
// Some third-party libs (crypto, websocket helpers) expect `global`/`process` to exist.
// Define them early so module evaluation doesn't crash with "global is not defined".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).global = (window as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).process = (window as any).process || { env: {} };

// Note: keep this file minimal. Zone.js is still included via angular.json polyfills array.
