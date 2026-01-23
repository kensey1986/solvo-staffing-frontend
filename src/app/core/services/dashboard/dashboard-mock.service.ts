import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardData } from '../../models/dashboard.model';
import { IDashboardService } from '../../interfaces/dashboard-service.interface';

/**
 * Dashboard Mock Service
 *
 * Provides simulated dashboard data with a delay to mimic API calls.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardMockService implements IDashboardService {
  /**
   * Retrieves mock KPI data for the dashboard.
   * @returns Observable with mock dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    const mockData: DashboardData = {
      vacancyKpis: [
        { label: 'Detectadas', value: '2,847', icon: 'schedule', color: 'purple' },
        { label: 'Contactadas', value: '423', icon: 'phone', color: 'blue' },
        { label: 'Propuesta', value: '256', icon: 'description', color: 'orange' },
        { label: 'Ganadas', value: '89', icon: 'check_circle', color: 'green' },
        { label: 'Perdidas', value: '156', icon: 'cancel', color: 'orange' },
      ],
      companyKpis: [
        { label: 'Leads', value: '156', icon: 'group_add', color: 'purple' },
        { label: 'Prospecting', value: '87', icon: 'search', color: 'blue' },
        { label: 'Engaged', value: '54', icon: 'handshake', color: 'blue' },
        { label: 'Appt Held', value: '32', icon: 'event', color: 'orange' },
        { label: 'Client', value: '23', icon: 'business', color: 'green' },
        { label: 'Lost', value: '34', icon: 'person_off', color: 'orange' },
      ],
    };

    return of(mockData).pipe(delay(300));
  }
}
