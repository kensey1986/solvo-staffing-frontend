/**
 * Auth Mock Service
 *
 * Mock implementation of IAuthService for development and testing.
 * Validates against hardcoded credentials and simulates API responses.
 */

import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { User } from '../../models/user.model';

/** Simulated network delay in milliseconds */
const MOCK_DELAY = 500;

/** LocalStorage keys */
const TOKEN_KEY = 'solvo_token';
const USER_KEY = 'solvo_user';

@Injectable()
export class AuthMockService implements IAuthService {
  /** Valid email for mock authentication */
  private readonly VALID_EMAIL = 'testuser@gmail.com';

  /** Valid password for mock authentication */
  private readonly VALID_PASSWORD = '123456789*';

  /** Mock user data returned on successful login */
  private readonly MOCK_USER: User = {
    id: 1,
    email: 'testuser@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'commercial',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  /** Current authenticated user (signal-based) */
  private readonly currentUser = signal<User | null>(null);

  /** Current access token (signal-based) */
  private readonly accessToken = signal<string | null>(null);

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    return of(null).pipe(
      delay(MOCK_DELAY),
      switchMap(() => {
        if (
          credentials.email === this.VALID_EMAIL &&
          credentials.password === this.VALID_PASSWORD
        ) {
          const token = 'mock-jwt-' + Date.now();
          this.accessToken.set(token);
          this.currentUser.set(this.MOCK_USER);

          // Persist session
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(this.MOCK_USER));

          return of({
            user: this.MOCK_USER,
            accessToken: token,
          });
        }

        return throwError(() => new Error('Email o contraseña incorrectos'));
      })
    );
  }

  logout(): Observable<void> {
    return of(null).pipe(
      delay(MOCK_DELAY / 2),
      switchMap(() => {
        this.clearSession();
        return of(undefined);
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser());
  }

  isAuthenticated(): boolean {
    return this.accessToken() !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  restoreSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.accessToken.set(token);
        this.currentUser.set(user);
        console.log('[AuthMockService] Session restored');
      } catch {
        // Invalid stored data, clear it
        this.clearSession();
      }
    }
  }

  /**
   * Clears the session from memory and localStorage.
   */
  private clearSession(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('[AuthMockService] Session cleared');
  }
}
