/**
 * Auth Mock Service
 *
 * Mock implementation of IAuthService for development and testing.
 * Simulates authentication responses with static data.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { IAuthService } from '../../interfaces/auth-service.interface';

/** Simulated network delay in milliseconds */
const MOCK_DELAY = 500;

/** Mock user data */
const MOCK_USER: LoginResponseDto['user'] = {
  id: 1,
  email: 'admin@solvo.com',
  name: 'Admin User',
  role: 'admin',
};

/** Mock tokens */
const MOCK_ACCESS_TOKEN = 'mock-access-token-' + Date.now();
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-' + Date.now();

@Injectable()
export class AuthMockService implements IAuthService {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private currentUser: LoginResponseDto['user'] | null = null;

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    // Simple mock validation
    if (credentials.email === 'admin@solvo.com' && credentials.password === 'password') {
      const response: LoginResponseDto = {
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        expiresIn: 3600, // 1 hour
        user: MOCK_USER,
      };

      return of(response).pipe(
        delay(MOCK_DELAY),
        tap(() => {
          this.setTokens(response.accessToken, response.refreshToken);
          this.currentUser = response.user;
        })
      );
    } else {
      // Simulate error
      return of({
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        user: { id: 0, email: '', name: '', role: '' },
      }).pipe(
        delay(MOCK_DELAY),
        tap(() => {
          throw new Error('Invalid credentials');
        })
      );
    }
  }

  logout(): void {
    this.clearTokens();
  }

  refreshToken(): Observable<LoginResponseDto> {
    const response: LoginResponseDto = {
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
      expiresIn: 3600,
      user: MOCK_USER,
    };

    return of(response).pipe(
      delay(MOCK_DELAY),
      tap(() => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUser = response.user;
      })
    );
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  getCurrentUser(): LoginResponseDto['user'] | null {
    if (!this.currentUser) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
        } catch {
          this.currentUser = null;
        }
      }
    }
    return this.currentUser;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;
    this.currentUser = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }
}
