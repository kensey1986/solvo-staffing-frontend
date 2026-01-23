/**
 * Callback Component
 *
 * Handles SSO callback from Microsoft Entra ID.
 * Processes the token from URL and establishes the session.
 */

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AUTH_SERVICE, AUTH_SERVICE_PROVIDER } from '@core/providers/auth-service.provider';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule, MatSnackBarModule],
  providers: [AUTH_SERVICE_PROVIDER],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbackComponent implements OnInit {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  /** Whether the callback is being processed */
  readonly isProcessing = signal(true);

  /** Error message if callback failed */
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.processCallback();
  }

  /**
   * Processes the SSO callback parameters.
   */
  private processCallback(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.handleError('Error de autenticación: ' + error);
      return;
    }

    if (!token) {
      this.handleError('No se recibió token de autenticación');
      return;
    }

    this.authService.handleSsoCallback(token).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.handleError(err.message);
      },
    });
  }

  /**
   * Handles callback errors.
   */
  private handleError(message: string): void {
    this.isProcessing.set(false);
    this.errorMessage.set(message);
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }
}
