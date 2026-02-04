import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService, ThemeMode } from '@core';

/**
 * ThemeToggleComponent
 *
 * A toggle button to switch between light and dark themes.
 * Displays a sun icon for light mode and a moon icon for dark mode.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
  template: `
    <button mat-icon-button (click)="themeService.toggleTheme()" [matTooltip]="tooltipText()">
      <mat-icon>{{ iconName() }}</mat-icon>
    </button>
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
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  private readonly translate = inject(TranslateService);

  theme = this.themeService.theme;

  iconName(): string {
    const current = this.theme() as ThemeMode;
    return current === 'light' ? 'dark_mode' : 'light_mode';
  }

  tooltipText(): string {
    const current = this.theme() as ThemeMode;
    const key = current === 'light' ? 'THEME.SWITCH_TO_DARK' : 'THEME.SWITCH_TO_LIGHT';
    return this.translate.instant(key);
  }
}
