/**
 * Auth Service Interface
 *
 * Contract for authentication service implementations.
 */

import { Observable } from 'rxjs';
import { LoginDto, LoginResponseDto } from '../dtos/auth.dto';

/**
 * Authentication service interface.
 */
export interface IAuthService {
  /**
   * Authenticates a user with email and password.
   * @param credentials User login credentials
   * @returns Observable with login response containing tokens and user info
   */
  login(credentials: LoginDto): Observable<LoginResponseDto>;

  /**
   * Logs out the current user by clearing stored tokens.
   */
  logout(): void;

  /**
   * Refreshes the access token using the refresh token.
   * @returns Observable with new tokens
   */
  refreshToken(): Observable<LoginResponseDto>;

  /**
   * Checks if the user is currently authenticated.
   * @returns True if user has valid tokens
   */
  isAuthenticated(): boolean;

  /**
   * Gets the current access token.
   * @returns Access token or null if not authenticated
   */
  getAccessToken(): string | null;

  /**
   * Gets the current user information.
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): LoginResponseDto['user'] | null;
}
