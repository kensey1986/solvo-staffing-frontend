import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  VACANCY_SERVICE,
  VACANCY_SERVICE_PROVIDER,
  COMPANY_SERVICE_PROVIDER,
  Vacancy,
  PipelineStage,
  VacancyStatus,
  VacancySource,
  VacancyFilterParams,
  PaginatedResponse,
  CreateVacancyDto,
} from '@core';
import {
  PipelineBadgeComponent,
  StatusBadgeComponent,
  CreateVacancyModalComponent,
  CreateVacancyFormData,
} from '@shared';

/**
 * VacanciesListComponent
 *
 * Main page for viewing and filtering vacancies.
 * Features a filter bar, data table, and pagination.
 */
@Component({
  selector: 'app-vacancies-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    PipelineBadgeComponent,
    StatusBadgeComponent,
    CreateVacancyModalComponent,
  ],
  providers: [VACANCY_SERVICE_PROVIDER, COMPANY_SERVICE_PROVIDER],
  templateUrl: './vacancies-list.component.html',
  styleUrl: './vacancies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesListComponent implements OnInit {
  private readonly vacancyService = inject(VACANCY_SERVICE);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Create modal state
  readonly showCreateModal = signal(false);

  // Loading state
  readonly isLoading = signal(false);

  // Pagination state
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);
  readonly totalItems = signal(0);

  // Filter state
  readonly searchFilter = signal('');
  readonly statusFilter = signal<VacancyStatus | ''>('');
  readonly pipelineFilter = signal<PipelineStage | ''>('');
  readonly sourceFilter = signal<VacancySource | ''>('');
  readonly stateFilter = signal('');
  readonly companyFilter = signal('');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  // Data
  readonly vacancies = signal<Vacancy[]>([]);

  // Table columns
  readonly displayedColumns = [
    'jobTitle',
    'companyName',
    'location',
    'status',
    'pipelineStage',
    'source',
    'publishedDate',
    'actions',
  ];

  // Filter options
  readonly statusOptions: { value: VacancyStatus | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'filled', label: 'Filled' },
    { value: 'expired', label: 'Expired' },
  ];

  readonly pipelineOptions: { value: PipelineStage | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'detected', label: 'Detected' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ];

  readonly sourceOptions: { value: VacancySource | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'company_website', label: 'Website' },
    { value: 'manual', label: 'Manual' },
  ];

  readonly usStates = [
    { value: '', label: 'All' },
    { value: 'CA', label: 'California' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'GA', label: 'Georgia' },
    { value: 'IL', label: 'Illinois' },
    { value: 'CO', label: 'Colorado' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'MA', label: 'Massachusetts' },
  ];

  // Computed pagination info
  readonly paginationInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.totalItems());
    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${this.totalItems().toLocaleString()}`;
  });

  ngOnInit(): void {
    this.loadVacancies();
  }

  /**
   * Loads vacancies with current filters and pagination.
   */
  loadVacancies(): void {
    this.isLoading.set(true);

    const params: VacancyFilterParams = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchFilter() || undefined,
      status: this.statusFilter() || undefined,
      pipelineStage: this.pipelineFilter() || undefined,
      source: this.sourceFilter() || undefined,
      state: this.stateFilter() || undefined,
      company: this.companyFilter() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    };

    this.vacancyService.getAll(params).subscribe({
      next: (response: PaginatedResponse<Vacancy>) => {
        this.vacancies.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Error loading vacancies:', err);
        this.snackBar.open('Error loading vacancies', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Applies filters and reloads data.
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadVacancies();
  }

  /**
   * Clears all filters.
   */
  clearFilters(): void {
    this.searchFilter.set('');
    this.statusFilter.set('');
    this.pipelineFilter.set('');
    this.sourceFilter.set('');
    this.stateFilter.set('');
    this.companyFilter.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.applyFilters();
  }

  /**
   * Handles page change event.
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadVacancies();
  }

  /**
   * Navigates to vacancy detail page.
   */
  goToDetail(vacancy: Vacancy): void {
    this.router.navigate(['/vacancies', vacancy.id]);
  }

  /**
   * Opens the create vacancy dialog.
   */
  openCreateDialog(): void {
    this.showCreateModal.set(true);
  }

  /**
   * Closes the create vacancy modal.
   */
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  /**
   * Handles vacancy creation from modal.
   */
  onCreateVacancy(formData: CreateVacancyFormData): void {
    if (!formData.companyId) return;

    const dto: CreateVacancyDto = {
      jobTitle: formData.jobTitle,
      companyId: formData.companyId,
      location: formData.location || undefined,
      department: formData.department || undefined,
      seniorityLevel: formData.seniorityLevel || undefined,
      salaryRange: formData.salaryRange || undefined,
    };

    this.vacancyService.create(dto).subscribe({
      next: vacancy => {
        this.snackBar.open(`Vacante "${vacancy.jobTitle}" creada exitosamente`, 'Cerrar', {
          duration: 3000,
        });
        this.closeCreateModal();
        this.loadVacancies();
      },
      error: err => {
        console.error('Error creating vacancy:', err);
        this.snackBar.open('Error al crear la vacante', 'Cerrar', { duration: 3000 });
      },
    });
  }

  /**
   * Formats date for display.
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /**
   * Gets source label for display.
   */
  getSourceLabel(source: VacancySource): string {
    const labels: Record<VacancySource, string> = {
      indeed: 'Indeed',
      linkedin: 'LinkedIn',
      company_website: 'Website',
      manual: 'Manual',
    };
    return labels[source] || source;
  }
}
