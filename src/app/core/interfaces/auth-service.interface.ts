/**
 * Auth Service Interface
 *
 * Defines the contract for authentication service implementations.
 * Both mock and API services must implement this interface.
 */

import { Observable } from 'rxjs';
import { LoginDto, LoginResponseDto, SsoProvider, SsoInitResponseDto } from '../dtos/auth.dto';
import { User } from '../models/user.model';

/**
 * Interface for authentication service operations.
 * Follows API-first principle - contract is defined before implementation.
 */
export interface IAuthService {
  /**
   * Authenticates a user with email and password.
   * @param credentials - Login credentials
   * @returns Observable of login response with user and token
   */
  login(credentials: LoginDto): Observable<LoginResponseDto>;

  /**
   * Logs out the current user and clears the session.
   * @returns Observable that completes on logout
   */
  logout(): Observable<void>;

  /**
   * Retrieves the currently authenticated user.
   * @returns Observable of the current user or null if not authenticated
   */
  getCurrentUser(): Observable<User | null>;

  /**
   * Checks if a user is currently authenticated.
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean;

  /**
   * Gets the current access token.
   * @returns The access token or null if not authenticated
   */
  getAccessToken(): string | null;

  /**
   * Restores the session from localStorage on app initialization.
   */
  restoreSession(): void;

  /**
   * Initiates SSO login flow.
   * @param provider - SSO provider (e.g., 'microsoft')
   * @returns Observable with authorization URL
   */
  initSsoLogin(provider: SsoProvider): Observable<SsoInitResponseDto>;

  /**
   * Handles SSO callback and establishes session.
   * @param token - Token received from callback
   * @returns Observable of login response
   */
  handleSsoCallback(token: string): Observable<LoginResponseDto>;
}
