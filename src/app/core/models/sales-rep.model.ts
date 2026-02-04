/**
 * Sales Rep Model
 *
 * Represents a sales representative (commercial) in the system.
 */

/**
 * Sales Rep entity representing a sales representative.
 */
export interface SalesRep {
  /** Unique identifier */
  id: number;
  /** Display name (short format, e.g., "Carlos M.") */
  displayName: string;
  /** Full name */
  fullName: string;
  /** Email address */
  email: string;
}
