/**
 * Sales Rep API Service
 *
 * Real API implementation of ISalesRepService.
 * Communicates with the backend API for sales representative data.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../../config/env.config';
import { ISalesRepService } from '../../interfaces/sales-rep-service.interface';
import { SalesRep } from '../../models/sales-rep.model';

@Injectable()
export class SalesRepApiService implements ISalesRepService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${ENV.apiBaseUrl}/${ENV.apiVersion}/sales-reps`;

  /**
   * Gets all sales representatives from the API.
   * @returns Observable with list of all sales reps
   */
  getAll(): Observable<SalesRep[]> {
    return this.http.get<SalesRep[]>(this.baseUrl);
  }

  /**
   * Searches sales representatives by name.
   * @param query - Search query string
   * @returns Observable with filtered list of sales reps
   */
  search(query: string): Observable<SalesRep[]> {
    return this.http.get<SalesRep[]>(this.baseUrl, {
      params: { search: query },
    });
  }
}
