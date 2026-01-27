import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent, CustomButtonComponent } from '@shared';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DASHBOARD_SERVICE, DASHBOARD_SERVICE_PROVIDER } from '@core';
import { DashboardData } from '@core/models/dashboard.model';

/**
 * DashboardPageComponent
 *
 * New dashboard view showing KPI pipelines for vacancies and companies.
 * Data is fetched from the DashboardService (Mock or API).
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, CustomButtonComponent, MatButtonModule, MatIconModule],
  providers: [DASHBOARD_SERVICE_PROVIDER],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DASHBOARD_SERVICE);

  /**
   * Complete dashboard data (signal-based)
   */
  public readonly dashboardData = signal<DashboardData | null>(null);

  /**
   * Whether the data is loading
   */
  public readonly isLoading = signal(true);

  /**
   * Whether an error occurred during loading
   */
  public readonly hasError = signal(false);

  /**
   * Timestamp of the last successful data fetch
   */
  public readonly lastUpdated = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads dashboard data and updates the lastUpdated timestamp.
   */
  public loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.dashboardData.set(data);
        this.lastUpdated.set(new Date().toLocaleTimeString());
        this.isLoading.set(false);
      },
      error: err => {
        console.error('[DashboardPage] Error loading dashboard data:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
