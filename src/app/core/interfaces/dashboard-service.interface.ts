import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';

/**
 * IDashboardService interface
 *
 * Defines the contract for dashboard data services.
 */
export interface IDashboardService {
  /**
   * Retrieves KPI data for the dashboard pipelines.
   * @returns Observable with dashboard data
   */
  getDashboardData(): Observable<DashboardData>;
}
