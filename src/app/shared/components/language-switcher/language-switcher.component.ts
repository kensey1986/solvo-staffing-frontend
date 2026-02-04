import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from '@core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslateModule],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="langMenu"
      [matTooltip]="'LANGUAGE.TOOLTIP' | translate"
    >
      <mat-icon>language</mat-icon>
    </button>
    <mat-menu #langMenu="matMenu">
      @if (languageService.language() === 'es') {
        <button mat-menu-item (click)="setLanguage('en')">
          {{ 'LANGUAGE.ENGLISH' | translate }}
        </button>
      }
      @if (languageService.language() === 'en') {
        <button mat-menu-item (click)="setLanguage('es')">
          {{ 'LANGUAGE.SPANISH' | translate }}
        </button>
      }
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly languageService = inject(LanguageService);

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }
}
