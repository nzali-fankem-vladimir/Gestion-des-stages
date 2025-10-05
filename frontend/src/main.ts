// Define Node-like globals BEFORE any other imports so deps using them during module evaluation don't crash
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).global = globalThis;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process = (globalThis as any).process || { env: {} };

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
