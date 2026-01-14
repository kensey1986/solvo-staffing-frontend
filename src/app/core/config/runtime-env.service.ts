import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { applyRuntimeEnv, RuntimeEnv } from './env.config';

@Injectable({
  providedIn: 'root',
})
export class RuntimeEnvService {
  private readonly http = inject(HttpClient);

  async load(): Promise<void> {
    try {
      const runtimeEnv = await firstValueFrom(
        this.http.get<Partial<RuntimeEnv>>('/assets/env.json', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
      );

      if (runtimeEnv) {
        applyRuntimeEnv(runtimeEnv);
      }
    } catch (error) {
      console.warn('Runtime env not loaded, using defaults.', error);
    }
  }
}
