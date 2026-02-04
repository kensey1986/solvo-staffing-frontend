import { Injectable, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

/**
 * ThemeService
 *
 * Manages the application's light/dark theme preference.
 * Uses Angular Signals for reactive state and persists the choice in localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'solvo-theme-preference';
  private platformId = inject(PLATFORM_ID);

  // Signal to store the current theme
  theme = signal<ThemeMode>('light');

  constructor() {
    this.initializeTheme();

    // Effect to apply the theme class whenever the signal changes
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentTheme = this.theme();
        this.applyTheme(currentTheme);
        localStorage.setItem(this.STORAGE_KEY, currentTheme);
      }
    });
  }

  /**
   * Toggles between light and dark themes.
   */
  toggleTheme(): void {
    this.theme.update(current => (current === 'light' ? 'dark' : 'light'));
  }

  /**
   * Sets a specific theme.
   */
  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  /**
   * Loads the persisted theme or defaults to system preference.
   */
  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;

    if (savedTheme) {
      this.theme.set(savedTheme);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme.set(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Applies the 'dark' class to the html element.
   */
  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }
}
