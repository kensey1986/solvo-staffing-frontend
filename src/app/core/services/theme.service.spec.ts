import { jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { PLATFORM_ID } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Clear global DOM state to prevent test pollution
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';

    mockLocalStorage = {};

    const localStorageMock = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage = {};
      }),
      length: 0,
      key: jest.fn(() => null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial theme "light" by default', () => {
    expect(service.theme()).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    service.setTheme('dark');
    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });

  it('should set theme to "dark"', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should apply "dark" class to document element when theme is dark', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove "dark" class from document element when theme is light', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    service.setTheme('light');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should persist theme to localStorage', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(window.localStorage.setItem).toHaveBeenCalledWith('solvo-theme-preference', 'dark');
  });

  it('should initialize with saved theme from localStorage', () => {
    TestBed.resetTestingModule();
    mockLocalStorage['solvo-theme-preference'] = 'dark';
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const newService = TestBed.inject(ThemeService);
    expect(newService.theme()).toBe('dark');
  });

  it('should initialize with system preference if no saved theme', () => {
    TestBed.resetTestingModule();
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
    }));
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const newService = TestBed.inject(ThemeService);
    expect(newService.theme()).toBe('dark');
  });

  it('should NOT access localStorage or update theme when on server platform', () => {
    TestBed.resetTestingModule();

    // Reset mocks to ensure no previous calls are counted
    (window.localStorage.getItem as jest.Mock).mockClear();
    (window.localStorage.setItem as jest.Mock).mockClear();

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'server' }],
    });
    const serverService = TestBed.inject(ThemeService);

    // initializeTheme should return early
    expect(serverService.theme()).toBe('light'); // Default
    expect(window.localStorage.getItem).not.toHaveBeenCalled();

    // Effect check
    serverService.setTheme('dark');
    TestBed.flushEffects();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
