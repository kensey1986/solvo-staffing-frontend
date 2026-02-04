/**
 * Sales Rep Service Interface
 *
 * Defines the contract for sales rep service implementations.
 */

import { Observable } from 'rxjs';
import { SalesRep } from '../models/sales-rep.model';

/**
 * Interface for sales rep service operations.
 */
export interface ISalesRepService {
  /**
   * Gets all sales representatives.
   * @returns Observable with list of sales reps
   */
  getAll(): Observable<SalesRep[]>;

  /**
   * Searches sales representatives by name.
   * @param query - Search query string
   * @returns Observable with filtered list of sales reps
   */
  search(query: string): Observable<SalesRep[]>;
}
