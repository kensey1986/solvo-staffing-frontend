import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

/**
 * AuthLayoutComponent
 *
 * Layout component for authentication pages (login, register, forgot password).
 * Features a centered card layout with branding.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent],
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
