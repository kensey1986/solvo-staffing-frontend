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
