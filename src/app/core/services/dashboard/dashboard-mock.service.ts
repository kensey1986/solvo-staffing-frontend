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
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper to check if a date string (YYYY-MM-DD) is within the last 24h
    const isLast24h = (dateStr?: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= oneDayAgo && date <= now;
    };

    // Helper to check if a date string (YYYY-MM-DD) is in the current month
    const isCurrentMonth = (dateStr?: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= firstDayOfMonth && date <= now;
    };

    // --- Vacancy KPIs ---
    let detected24h = 0;
    let detectedMonth = 0;
    let contactedMonth = 0;
    let wonMonth = 0;
    let lostMonth = 0;

    MOCK_VACANCIES.forEach(v => {
      if (v.pipelineStage === 'detected') {
        if (isLast24h(v.publishedDate)) detected24h++;
        if (isCurrentMonth(v.publishedDate)) detectedMonth++;
      }
      if (v.pipelineStage === 'contacted' && isCurrentMonth(v.publishedDate)) {
        contactedMonth++;
      }
      if (v.pipelineStage === 'won' && isCurrentMonth(v.publishedDate)) {
        wonMonth++;
      }
      if (v.pipelineStage === 'lost' && isCurrentMonth(v.publishedDate)) {
        lostMonth++;
      }
    });

    // --- Company KPIs ---
    let compDetected24h = 0;
    let compDetectedMonth = 0;
    let compProspectingMonth = 0;
    let compOnboardingMonth = 0;
    let compLostMonth = 0;

    // Mapping 'lead' as 'detected' for companies based on prototype "Detected" label?
    // Prototype says "Detected" for companies. MOCK_COMPANIES has 'lead' stage.
    // Assuming 'lead' corresponds to 'Detected' in the UI.

    MOCK_COMPANIES.forEach(c => {
      // Use createdAt for detection date
      if (c.pipelineStage === 'lead') {
        if (isLast24h(c.createdAt)) compDetected24h++;
        if (isCurrentMonth(c.createdAt)) compDetectedMonth++;
      }
      // For other stages, typically we'd look at state history for "when it entered this stage"
      // But for simplicity in this mock, we'll check if the company is currently in that stage
      // and if it was updated in the current month.

      if (c.pipelineStage === 'prospecting' && isCurrentMonth(c.updatedAt)) {
        compProspectingMonth++;
      }
      if (c.pipelineStage === 'onboarding_started' && isCurrentMonth(c.updatedAt)) {
        compOnboardingMonth++;
      }
      if (c.pipelineStage === 'lost' && isCurrentMonth(c.updatedAt)) {
        compLostMonth++;
      }
    });

    // Fallback counts (if 0, show total counts for demo purposes so it doesn't look empty given outdated mock data)
    // NOTE: In a real app we wouldn't do this, but for the "Presentation" of a Prototype with static date data,
    // we might want to show *something*.
    // However, the request is to "Adjust labels...". I'll stick to the logic.
    // If the user wants to see data, they should add data with current dates.
    // actually, let's loosen the restriction for the 'Month' view to just show all-time for this mock
    // if the result is 0, to match the "static prototype" feel if desired?
    // No, I will trust the logic. The user can create new items.

    const toCount = (value: number) => value.toLocaleString('en-US');

    const mockData: DashboardData = {
      vacancyKpis: [
        {
          label: 'DASHBOARD.KPI_DETECTED_24H',
          value: toCount(detected24h),
          icon: 'schedule',
          color: 'purple',
        },
        {
          label: 'DASHBOARD.KPI_DETECTED_MONTH',
          value: toCount(detectedMonth),
          icon: 'calendar_today',
          color: 'purple',
        },
        {
          label: 'DASHBOARD.KPI_CONTACTED_MONTH',
          value: toCount(contactedMonth),
          icon: 'phone',
          color: 'blue',
        },
        {
          label: 'DASHBOARD.KPI_WON_MONTH',
          value: toCount(wonMonth),
          icon: 'check_circle',
          color: 'green',
        },
        {
          label: 'DASHBOARD.KPI_LOST_MONTH',
          value: toCount(lostMonth), // Using 'lost' count as per prototype 'Lost Month'
          icon: 'cancel',
          color: 'orange', // Prototype shows orange/red for lost
        },
      ],
      companyKpis: [
        {
          label: 'DASHBOARD.KPI_DETECTED_24H',
          value: toCount(compDetected24h),
          icon: 'schedule',
          color: 'purple', // Prototype color
        },
        {
          label: 'DASHBOARD.KPI_DETECTED_MONTH',
          value: toCount(compDetectedMonth),
          icon: 'calendar_today',
          color: 'purple',
        },
        {
          label: 'DASHBOARD.KPI_PROSPECTING_MONTH',
          value: toCount(compProspectingMonth),
          icon: 'grid_view', // Prototype icon looks like 'window' or 'grid' or 'book' -> 'book' is 'class'? 'grid_view'?
          // Icon in screenshot is 'prospecting' (magnifying glass? No, companies pipeline prospecting is 'book' or 'open book'?)
          // Screenshot: "Prospecting Month" icon looks like an open book or layout.
          // Let's use 'menu_book' or 'chrome_reader_mode'.
          // "Prospecting" usually implies research.
          // Previous icon was 'search'.
          // Screenshot icon looks like `chrome_reader_mode` or `class`.
          // I will use `chrome_reader_mode` as it looks like the screenshot (open book/layout).
          color: 'blue',
        },
        {
          label: 'DASHBOARD.KPI_ONBOARDING_MONTH',
          value: toCount(compOnboardingMonth),
          icon: 'check_circle_outline', // Screenshot: Check in circle. 'check_circle' or 'task_alt'.
          // Previous was 'business' for Client.
          // Now 'Onboarding Month'.
          // Screenshot icon: Check mark inside circle (outline?).
          color: 'green',
        },
        {
          label: 'DASHBOARD.KPI_LOST_MONTH',
          value: toCount(compLostMonth),
          icon: 'cancel', // Screenshot: X in circle. 'cancel' is filled X. 'highlight_off' is outline?
          // Screenshot looks like 'cancel' (filled) or 'highlight_off'.
          // Vacancy Lost had 'cancel'. I'll use 'cancel'.
          color: 'orange',
        },
      ],
    };

    return of(mockData).pipe(delay(300));
  }
}
