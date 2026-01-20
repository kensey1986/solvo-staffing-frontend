/**
 * User Model
 *
 * Defines the user entity and related types for authentication.
 */

/**
 * Available user roles in the system.
 */
export type UserRole = 'admin' | 'commercial' | 'recruiter' | 'viewer';

/**
 * User entity representing an authenticated user.
 */
export interface User {
  /** Unique user identifier */
  id: number;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's role in the system */
  role: UserRole;
  /** URL to user's avatar image */
  avatarUrl?: string | null;
  /** ISO timestamp of when the user was created */
  createdAt: string;
  /** ISO timestamp of when the user was last updated */
  updatedAt: string;
}
