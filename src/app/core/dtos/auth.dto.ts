/**
 * Authentication DTOs
 *
 * Data Transfer Objects for authentication operations.
 */

import { User } from '../models/user.model';

/**
 * DTO for login request.
 */
export interface LoginDto {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * DTO for login response.
 */
export interface LoginResponseDto {
  /** Authenticated user data */
  user: User;
  /** JWT access token */
  accessToken: string;
}

/**
 * Supported SSO providers.
 */
export type SsoProvider = 'microsoft';

/**
 * DTO for SSO initialization response.
 */
export interface SsoInitResponseDto {
  /** Authorization URL to redirect the user */
  authUrl: string;
}

/**
 * DTO for SSO callback parameters.
 */
export interface SsoCallbackDto {
  /** Token received from backend after Microsoft auth */
  token?: string;
  /** Error code if authentication failed */
  error?: string;
}
