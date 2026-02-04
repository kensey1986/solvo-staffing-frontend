import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

/**
 * AuthLayoutComponent
 *
 * Layout component for authentication pages (login, register, forgot password).
 * Features a centered card layout with branding.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, ThemeToggleComponent, LanguageSwitcherComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  /**
   * Current year for copyright notice.
   */
  public readonly currentYear = new Date().getFullYear();
}
