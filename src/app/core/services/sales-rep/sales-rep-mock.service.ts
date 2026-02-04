/**
 * Sales Rep Mock Service
 *
 * Mock implementation of ISalesRepService for development and testing.
 * Provides consistent mock data for sales representatives.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ISalesRepService } from '../../interfaces/sales-rep-service.interface';
import { SalesRep } from '../../models/sales-rep.model';

/** Simulated network delay in milliseconds */
const MOCK_DELAY = 200;

/**
 * Mock sales representatives data.
 * These names match the assignedTo values used across company and vacancy mocks.
 */
export const MOCK_SALES_REPS: SalesRep[] = [
  {
    id: 1,
    displayName: 'Carlos M.',
    fullName: 'Carlos Mendoza',
    email: 'carlos.mendoza@solvo.com',
  },
  {
    id: 2,
    displayName: 'María G.',
    fullName: 'María García',
    email: 'maria.garcia@solvo.com',
  },
  {
    id: 3,
    displayName: 'Juan P.',
    fullName: 'Juan Pérez',
    email: 'juan.perez@solvo.com',
  },
  {
    id: 4,
    displayName: 'Ana R.',
    fullName: 'Ana Rodriguez',
    email: 'ana.rodriguez@solvo.com',
  },
  {
    id: 5,
    displayName: 'Pedro S.',
    fullName: 'Pedro Sánchez',
    email: 'pedro.sanchez@solvo.com',
  },
];

@Injectable()
export class SalesRepMockService implements ISalesRepService {
  private readonly salesReps = [...MOCK_SALES_REPS];

  /**
   * Gets all sales representatives.
   * @returns Observable with list of all sales reps
   */
  getAll(): Observable<SalesRep[]> {
    return of([...this.salesReps]).pipe(delay(MOCK_DELAY));
  }

  /**
   * Searches sales representatives by name.
   * @param query - Search query string
   * @returns Observable with filtered list of sales reps
   */
  search(query: string): Observable<SalesRep[]> {
    if (!query || !query.trim()) {
      return this.getAll();
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = this.salesReps.filter(
      rep =>
        rep.displayName.toLowerCase().includes(searchTerm) ||
        rep.fullName.toLowerCase().includes(searchTerm)
    );

    return of(filtered).pipe(delay(MOCK_DELAY));
  }
}
