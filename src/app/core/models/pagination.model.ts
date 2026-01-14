/**
 * Pagination Models
 *
 * Generic pagination types for paginated API responses.
 */

/**
 * Paginated response wrapper.
 * Used for all list endpoints that support pagination.
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Pagination request parameters.
 */
export interface PaginationParams {
  /** Page number to fetch (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Default pagination values.
 */
export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 1,
  pageSize: 50,
  sortBy: 'publishedDate',
  sortOrder: 'desc',
};
