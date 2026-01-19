/**
 * Auth DTOs
 *
 * Data Transfer Objects for authentication operations.
 */

/**
 * Login request DTO.
 */
export interface LoginDto {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Login response DTO.
 */
export interface LoginResponseDto {
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration time in seconds */
  expiresIn: number;
  /** User information */
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
