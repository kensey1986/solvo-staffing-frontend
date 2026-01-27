import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardData } from '../../models/dashboard.model';
import { IDashboardService } from '../../interfaces/dashboard-service.interface';
import { MOCK_VACANCIES } from '../vacancy/vacancy-mock.service';
import { MOCK_COMPANIES } from '../company/company-mock.service';

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
    const vacancyStageCounts = MOCK_VACANCIES.reduce(
      (acc, vacancy) => {
        acc[vacancy.pipelineStage] = (acc[vacancy.pipelineStage] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const companyStageCounts = MOCK_COMPANIES.reduce(
      (acc, company) => {
        acc[company.pipelineStage] = (acc[company.pipelineStage] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const toCount = (value: number) => value.toLocaleString('en-US');

    const mockData: DashboardData = {
      vacancyKpis: [
        {
          label: 'Detectadas',
          value: toCount(vacancyStageCounts['detected'] || 0),
          icon: 'schedule',
          color: 'purple',
        },
        {
          label: 'Contactadas',
          value: toCount(vacancyStageCounts['contacted'] || 0),
          icon: 'phone',
          color: 'blue',
        },
        {
          label: 'Propuesta',
          value: toCount(vacancyStageCounts['proposal'] || 0),
          icon: 'description',
          color: 'orange',
        },
        {
          label: 'Ganadas',
          value: toCount(vacancyStageCounts['won'] || 0),
          icon: 'check_circle',
          color: 'green',
        },
        {
          label: 'Perdidas',
          value: toCount(vacancyStageCounts['lost'] || 0),
          icon: 'cancel',
          color: 'orange',
        },
      ],
      companyKpis: [
        {
          label: 'Leads',
          value: toCount(companyStageCounts['lead'] || 0),
          icon: 'group_add',
          color: 'purple',
        },
        {
          label: 'Prospecting',
          value: toCount(companyStageCounts['prospecting'] || 0),
          icon: 'search',
          color: 'blue',
        },
        {
          label: 'Engaged',
          value: toCount(companyStageCounts['engaged'] || 0),
          icon: 'handshake',
          color: 'blue',
        },
        {
          label: 'Appt Held',
          value: toCount(companyStageCounts['initial_appointment_held'] || 0),
          icon: 'event',
          color: 'orange',
        },
        {
          label: 'Client',
          value: toCount(companyStageCounts['onboarding_started'] || 0),
          icon: 'business',
          color: 'green',
        },
        {
          label: 'Lost',
          value: toCount(companyStageCounts['lost'] || 0),
          icon: 'person_off',
          color: 'orange',
        },
      ],
    };

    return of(mockData).pipe(delay(300));
  }
}
