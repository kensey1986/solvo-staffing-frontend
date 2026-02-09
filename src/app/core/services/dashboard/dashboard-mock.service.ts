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
    // --- Vacancy KPIs (Static Data for Prototype Match) ---
    // Matches http://localhost:4200/dashboard prototype values
    const detected24h = 127;
    const detectedMonth = 2847;
    const contactedMonth = 423;
    const wonMonth = 89;
    const lostMonth = 156;

    // --- Company KPIs (Static Data for Prototype Match) ---
    const compDetected24h = 12;
    const compDetectedMonth = 156;
    const compProspectingMonth = 87;
    const compOnboardingMonth = 23;
    const compLostMonth = 34;

    /*
    // Original Dynamic Logic (Commented out for Prototype Fidelity)
    MOCK_VACANCIES.forEach(v => {
       // ... logic ...
    });
    */

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
