import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../../models/dashboard.model';
import { IDashboardService } from '../../interfaces/dashboard-service.interface';
import { ENV } from '../../config/env.config';

/**
 * Dashboard API Service
 *
 * Implementation of IDashboardService that communicates with the backend API.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardApiService implements IDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${ENV.apiUrl}/dashboard`;

  /**
   * Retrieves KPI data from the backend API.
   * @returns Observable with dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
