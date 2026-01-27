import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

import {
  VACANCY_SERVICE,
  VACANCY_SERVICE_PROVIDER,
  COMPANY_SERVICE_PROVIDER,
  Vacancy,
  VacancyStatus,
  VacancySource,
  VacancyFilterParams,
  PaginatedResponse,
  CreateVacancyDto,
} from '@core';
import {
  PipelineBadgeComponent,
  CreateVacancyModalComponent,
  CreateVacancyFormData,
  CustomPaginatorComponent,
  PageChangeEvent,
  CustomButtonComponent,
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,

    PipelineBadgeComponent,
    CreateVacancyModalComponent,
    CustomPaginatorComponent,
    CustomButtonComponent,
  ],
  providers: [VACANCY_SERVICE_PROVIDER, COMPANY_SERVICE_PROVIDER],
  templateUrl: './vacancies-list.component.html',
  styleUrl: './vacancies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesListComponent implements OnInit, OnDestroy {
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
  readonly totalPages = signal(0);
  readonly pageSizeOptions = [25, 50, 100];

  // Filter state
  readonly searchFilter = signal('');
  readonly statusFilter = signal<VacancyStatus | ''>('');
  readonly sourceFilter = signal<VacancySource | ''>('');
  readonly stateFilter = signal('');
  readonly companyFilter = signal('');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly assignedFilter = signal('');
  readonly myAssignmentsActive = signal(false);

  // Search debounce
  readonly isSearchingTitle = signal(false);
  readonly isSearchingCompany = signal(false);
  readonly isSearchingAssigned = signal(false);

  private readonly searchTitle$ = new Subject<string>();
  private readonly companySearch$ = new Subject<string>();
  private readonly assignedSearch$ = new Subject<string>();
  private readonly subscriptions = new Subscription();

  // Data
  readonly vacancies = signal<Vacancy[]>([]);

  // Table columns
  readonly displayedColumns = [
    'jobTitle',
    'companyName',
    'location',
    'status',
    'assignedTo',
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
    const total = this.totalItems();
    const current = this.currentPage();
    const pages = this.totalPages();
    return `${total.toLocaleString()} vacantes encontradas · Página ${current} de ${pages}`;
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchTitle$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
        this.isSearchingTitle.set(false);
        this.applyFilters();
      })
    );

    this.subscriptions.add(
      this.companySearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
        this.isSearchingCompany.set(false);
        this.applyFilters();
      })
    );

    this.subscriptions.add(
      this.assignedSearch$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
        this.isSearchingAssigned.set(false);
        this.applyFilters();
      })
    );

    this.loadVacancies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      source: this.sourceFilter() || undefined,
      state: this.stateFilter() || undefined,
      company: this.companyFilter() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
      assignedTo: this.assignedFilter() || (this.myAssignmentsActive() ? 'Carlos M.' : undefined),
    };

    this.vacancyService.getAll(params).subscribe({
      next: (response: PaginatedResponse<Vacancy>) => {
        this.vacancies.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
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

  onSearchTitleChange(value: string): void {
    this.searchFilter.set(value);
    this.isSearchingTitle.set(true);
    this.searchTitle$.next(value);
  }

  onCompanySearchChange(value: string): void {
    this.companyFilter.set(value);
    this.isSearchingCompany.set(true);
    this.companySearch$.next(value);
  }

  onAssignedSearchChange(value: string): void {
    this.assignedFilter.set(value);
    this.isSearchingAssigned.set(true);
    this.assignedSearch$.next(value);
  }

  /**
   * Clears all filters.
   */
  clearFilters(): void {
    this.searchFilter.set('');
    this.statusFilter.set('');
    this.sourceFilter.set('');
    this.stateFilter.set('');
    this.companyFilter.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.assignedFilter.set('');
    this.myAssignmentsActive.set(false);
    this.isSearchingTitle.set(false);
    this.isSearchingCompany.set(false);
    this.isSearchingAssigned.set(false);
    this.applyFilters();
  }

  /**
   * Toggles "My Assignments" filter.
   */
  toggleMyAssignments(): void {
    const newState = !this.myAssignmentsActive();
    this.myAssignmentsActive.set(newState);
    if (newState) {
      this.assignedFilter.set(''); // Clear specific assigned search if "Mine" is active
      this.isSearchingAssigned.set(false);
    }
    this.applyFilters();
  }

  /**
   * Handles page change event.
   */
  onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
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
