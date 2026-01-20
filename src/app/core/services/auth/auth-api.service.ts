/**
 * Auth API Service
 *
 * Real API implementation of IAuthService.
 * Connects to the backend authentication endpoints.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap, switchMap } from 'rxjs';
import { ENV } from '../../config/env.config';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { User } from '../../models/user.model';

/** LocalStorage keys */
const TOKEN_KEY = 'solvo_token';
const USER_KEY = 'solvo_user';

@Injectable()
export class AuthApiService implements IAuthService {
  private readonly http = inject(HttpClient);

  /** Current authenticated user (signal-based) */
  private readonly currentUser = signal<User | null>(null);

  /** Current access token (signal-based) */
  private readonly accessToken = signal<string | null>(null);

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    const url = `${ENV.apiUrl}/auth/login`;

    return this.http.post<LoginResponseDto>(url, credentials).pipe(
      tap(response => {
        this.accessToken.set(response.accessToken);
        this.currentUser.set(response.user);

        // Persist session
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      })
    );
  }

  logout(): Observable<void> {
    const url = `${ENV.apiUrl}/auth/logout`;

    // Try to notify the server, but always clear local session
    return this.http.post<void>(url, {}).pipe(
      tap({
        next: () => this.clearSession(),
        error: () => this.clearSession(),
      }),
      switchMap(() => of(undefined))
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
        console.log('[AuthApiService] Session restored');
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
    console.log('[AuthApiService] Session cleared');
  }
}
