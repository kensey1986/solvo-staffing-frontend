/**
 * Auth API Service
 *
 * Real API implementation of IAuthService.
 * Handles authentication with the backend API.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS, ENV } from '../../config/env.config';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { IAuthService } from '../../interfaces/auth-service.interface';

@Injectable()
export class AuthApiService implements IAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = ENV.apiUrl;

  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private currentUser: LoginResponseDto['user'] | null = null;

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    const url = `${this.baseUrl}${API_ENDPOINTS.auth.login}`;
    return this.http.post<LoginResponseDto>(url, credentials).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUser = response.user;
      })
    );
  }

  logout(): void {
    // Call logout endpoint if needed
    const url = `${this.baseUrl}${API_ENDPOINTS.auth.logout}`;
    this.http.post(url, {}).subscribe();

    // Clear local storage
    this.clearTokens();
  }

  refreshToken(): Observable<LoginResponseDto> {
    const url = `${this.baseUrl}${API_ENDPOINTS.auth.refresh}`;
    const refreshToken = this.getRefreshToken();

    return this.http.post<LoginResponseDto>(url, { refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUser = response.user;
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired (simple check, should decode JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
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

  private getRefreshToken(): string | null {
    if (!this.refreshTokenValue) {
      this.refreshTokenValue = localStorage.getItem('refreshToken');
    }
    return this.refreshTokenValue;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
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
