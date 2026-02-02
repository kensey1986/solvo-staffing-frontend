/**
 * Login Component
 *
 * Handles user authentication via Microsoft Entra ID.
 * Uses the AuthService for SSO operations.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AUTH_SERVICE, AUTH_SERVICE_PROVIDER } from '@core/providers/auth-service.provider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatSnackBarModule, MatProgressSpinnerModule, TranslateModule],
  providers: [AUTH_SERVICE_PROVIDER],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  /** Whether SSO login is in progress */
  readonly isSsoLoading = signal(false);

  /**
   * Initiates Microsoft SSO login flow.
   */
  loginWithMicrosoft(): void {
    this.isSsoLoading.set(true);

    this.authService.initSsoLogin('microsoft').subscribe({
      next: response => {
        window.location.href = response.authUrl;
      },
      error: (err: Error) => {
        this.isSsoLoading.set(false);
        this.snackBar.open(
          this.translate.instant('AUTH.LOGIN_ERROR') + err.message,
          this.translate.instant('AUTH.CLOSE'),
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          }
        );
      },
    });
  }
}
