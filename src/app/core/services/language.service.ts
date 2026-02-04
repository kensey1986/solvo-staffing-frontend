import { Injectable, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'solvo-language-preference';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translateService = inject(TranslateService);

  readonly language = signal<Language>('en');

  constructor() {
    this.initializeLanguage();

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentLang = this.language();
        this.translateService.use(currentLang);
        document.documentElement.lang = currentLang;
        localStorage.setItem(this.STORAGE_KEY, currentLang);
      }
    });
  }

  setLanguage(lang: Language): void {
    this.language.set(lang);
  }

  private initializeLanguage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem(this.STORAGE_KEY) as Language | null;

    if (saved && (saved === 'en' || saved === 'es')) {
      this.language.set(saved);
    }
  }
}
