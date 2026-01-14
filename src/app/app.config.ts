import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { RuntimeEnvService } from './core/config/runtime-env.service';

function initRuntimeEnv(): () => Promise<void> {
  const runtimeEnvService = inject(RuntimeEnvService);
  return () => runtimeEnvService.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initRuntimeEnv,
      multi: true,
    },
  ],
};
