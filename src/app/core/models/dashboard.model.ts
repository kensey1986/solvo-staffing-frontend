/**
 * Dashboard KPI Item
 */
export interface KpiItem {
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange';
}

/**
 * Complete Dashboard Data
 */
export interface DashboardData {
  vacancyKpis: KpiItem[];
  companyKpis: KpiItem[];
}
