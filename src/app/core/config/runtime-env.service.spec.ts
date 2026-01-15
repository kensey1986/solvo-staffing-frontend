/**
 * RuntimeEnvService Tests
 *
 * Unit tests for loading runtime env configuration.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import * as envConfig from './env.config';
import { RuntimeEnvService } from './runtime-env.service';

describe('RuntimeEnvService', () => {
  let service: RuntimeEnvService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RuntimeEnvService],
    });

    service = TestBed.inject(RuntimeEnvService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load runtime env and apply values', async () => {
    const applySpy = jest.spyOn(envConfig, 'applyRuntimeEnv');

    const loadPromise = service.load();

    const req = httpMock.expectOne('/assets/env.json');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Cache-Control')).toBe('no-cache');

    const payload: Partial<envConfig.RuntimeEnv> = {
      production: true,
      apiBaseUrl: 'https://api.example.com',
      apiVersion: 'v2',
      useMockServices: false,
    };

    req.flush(payload);
    await loadPromise;

    expect(applySpy).toHaveBeenCalledWith(payload);
  });

  it('should warn when runtime env fails to load', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const applySpy = jest.spyOn(envConfig, 'applyRuntimeEnv');

    const loadPromise = service.load();

    const req = httpMock.expectOne('/assets/env.json');
    req.flush('error', { status: 500, statusText: 'Server Error' });

    await loadPromise;

    expect(warnSpy).toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
