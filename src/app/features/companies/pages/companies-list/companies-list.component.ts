import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  COMPANY_SERVICE,
  COMPANY_SERVICE_PROVIDER,
  Company,
  CompanyPipelineStage,
  CompanyRelationshipType,
  CompanyFilterParams,
  PaginatedResponse,
  CreateCompanyDto,
  InvestigateCompanyDto,
  Country,
} from '@core';
import {
  CompanyPipelineBadgeComponent,
  RelationshipTypeBadgeComponent,
  CustomButtonComponent,
} from '@shared';

/**
 * Interface for create company form validation errors
 */
export interface CreateCompanyFormErrors {
  name: string;
  website: string;
  industry: string;
  location: string;
  employees: string;
}

/**
 * CompaniesListComponent
 *
 * Main page for viewing and filtering companies.
 * Features a filter bar, data table, pagination, and modals for create/investigate.
 */
@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    CompanyPipelineBadgeComponent,
    RelationshipTypeBadgeComponent,
    CustomButtonComponent,
    TranslateModule,
  ],
  providers: [COMPANY_SERVICE_PROVIDER],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesListComponent implements OnInit, OnDestroy {
  private readonly companyService = inject(COMPANY_SERVICE);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private langSubscription: { unsubscribe: () => void } | null = null;

  // Language change tracker
  private readonly currentLang = signal(this.translate.currentLang);

  // Loading state
  readonly isLoading = signal(false);

  // Modal state
  readonly showCreateModal = signal(false);
  readonly showInvestigateModal = signal(false);

  // Pagination state
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly totalItems = signal(0);

  // Filter state
  readonly searchFilter = signal('');
  readonly relationshipTypeFilter = signal<CompanyRelationshipType | ''>('');
  readonly pipelineFilter = signal<CompanyPipelineStage | ''>('');
  readonly assignedFilter = signal('');
  readonly myAssignmentsActive = signal(false);

  // Data
  readonly companies = signal<Company[]>([]);

  // Create form state
  readonly createForm = signal<CreateCompanyDto>({
    name: '',
    website: '',
    industry: undefined,
    location: '',
    employees: undefined,
  });

  // Create form validation
  readonly createFormSubmitted = signal(false);
  readonly createFormErrors = signal<CreateCompanyFormErrors>({
    name: '',
    website: '',
    industry: '',
    location: '',
    employees: '',
  });

  // Investigate form state
  readonly investigateForm = signal<InvestigateCompanyDto>({
    name: '',
    country: 'USA',
    website: '',
  });

  // Table columns
  readonly displayedColumns = [
    'name',
    'industry',
    'location',
    'relationshipType',
    'pipelineStage',
    'assignedTo',
    'actions',
  ];

  // Filter options with translation keys
  readonly relationshipTypeOptions = [
    { value: '' as const, labelKey: 'COMPANIES.TYPE_ALL' },
    { value: 'client' as const, labelKey: 'COMPANIES.TYPE_CLIENT' },
    { value: 'prospect' as const, labelKey: 'COMPANIES.TYPE_PROSPECT' },
    { value: 'lead' as const, labelKey: 'COMPANIES.TYPE_LEAD' },
    { value: 'inactive' as const, labelKey: 'COMPANIES.TYPE_INACTIVE' },
  ];

  readonly pipelineOptions = [
    { value: '' as const, labelKey: 'COMPANIES.PIPELINE_ALL' },
    { value: 'lead' as const, labelKey: 'COMPANIES.PIPELINE_LEAD' },
    { value: 'prospecting' as const, labelKey: 'COMPANIES.PIPELINE_PROSPECTING' },
    { value: 'engaged' as const, labelKey: 'COMPANIES.PIPELINE_ENGAGED' },
    { value: 'initial_appointment_held' as const, labelKey: 'COMPANIES.PIPELINE_INITIAL_APPT' },
    { value: 'onboarding_started' as const, labelKey: 'COMPANIES.PIPELINE_ONBOARDING' },
    { value: 'lost' as const, labelKey: 'COMPANIES.PIPELINE_LOST' },
  ];

  readonly industryOptions = [
    { value: '' as const, labelKey: 'COMPANIES.INDUSTRY_SELECT' },
    { value: 'technology' as const, labelKey: 'COMPANIES.INDUSTRY_TECHNOLOGY' },
    { value: 'healthcare' as const, labelKey: 'COMPANIES.INDUSTRY_HEALTHCARE' },
    { value: 'financial_services' as const, labelKey: 'COMPANIES.INDUSTRY_FINANCIAL' },
    { value: 'manufacturing' as const, labelKey: 'COMPANIES.INDUSTRY_MANUFACTURING' },
    { value: 'retail' as const, labelKey: 'COMPANIES.INDUSTRY_RETAIL' },
    { value: 'energy' as const, labelKey: 'COMPANIES.INDUSTRY_ENERGY' },
    { value: 'education' as const, labelKey: 'COMPANIES.INDUSTRY_EDUCATION' },
    { value: 'logistics' as const, labelKey: 'COMPANIES.INDUSTRY_LOGISTICS' },
    { value: 'construction' as const, labelKey: 'COMPANIES.INDUSTRY_CONSTRUCTION' },
    { value: 'other' as const, labelKey: 'COMPANIES.INDUSTRY_OTHER' },
  ];

  readonly employeeSizeOptions = [
    { value: '' as const, labelKey: 'COMPANIES.SIZE_SELECT' },
    { value: '1-50' as const, label: '1-50' },
    { value: '50-100' as const, label: '50-100' },
    { value: '100-200' as const, label: '100-200' },
    { value: '200-500' as const, label: '200-500' },
    { value: '500-1000' as const, label: '500-1000' },
    { value: '1000-5000' as const, label: '1000-5000' },
    { value: '5000+' as const, label: '5000+' },
  ];

  readonly countryOptions: { value: Country; label: string }[] = [
    { value: 'USA', label: 'USA' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Peru', label: 'Peru' },
    { value: 'Brazil', label: 'Brazil' },
  ];

  // Computed pagination info
  readonly paginationInfo = computed(() => {
    // Track language changes
    this.currentLang();
    const total = this.totalItems();
    if (total === 0) return this.translate.instant('COMPANIES.NO_COMPANIES_FOUND');
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return this.translate.instant('COMPANIES.SHOWING_RESULTS', {
      start: start.toLocaleString(),
      end: end.toLocaleString(),
      total: total.toLocaleString(),
    });
  });

  ngOnInit(): void {
    this.loadCompanies();

    // Subscribe to language changes and force change detection
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.currentLang.set(this.translate.currentLang);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  /**
   * Loads companies with current filters and pagination.
   */
  loadCompanies(): void {
    this.isLoading.set(true);

    const params: CompanyFilterParams = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchFilter() || undefined,
      relationshipType: this.relationshipTypeFilter() || undefined,
      pipelineStage: this.pipelineFilter() || undefined,
      assignedTo: this.assignedFilter() || (this.myAssignmentsActive() ? 'Carlos M.' : undefined),
    };

    this.companyService.getAll(params).subscribe({
      next: (response: PaginatedResponse<Company>) => {
        this.companies.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading companies:', err);
        this.snackBar.open(
          this.translate.instant('COMPANIES.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Applies filters and reloads data.
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadCompanies();
  }

  /**
   * Clears all filters.
   */
  clearFilters(): void {
    this.searchFilter.set('');
    this.relationshipTypeFilter.set('');
    this.pipelineFilter.set('');
    this.assignedFilter.set('');
    this.myAssignmentsActive.set(false);
    this.applyFilters();
  }

  /**
   * Toggles "My Assignments" filter.
   */
  toggleMyAssignments(): void {
    const newState = !this.myAssignmentsActive();
    this.myAssignmentsActive.set(newState);
    if (newState) {
      this.assignedFilter.set('');
    }
    this.applyFilters();
  }

  /**
   * Handles page change event.
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadCompanies();
  }

  /**
   * Navigates to company detail page.
   */
  goToDetail(company: Company): void {
    this.router.navigate(['/companies', company.id]);
  }

  /**
   * Opens the create company modal.
   */
  openCreateModal(): void {
    this.createForm.set({
      name: '',
      website: '',
      industry: undefined,
      location: '',
      employees: undefined,
    });
    this.createFormSubmitted.set(false);
    this.createFormErrors.set({
      name: '',
      website: '',
      industry: '',
      location: '',
      employees: '',
    });
    this.showCreateModal.set(true);
  }

  /**
   * Closes the create company modal.
   */
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  /**
   * Creates a new company.
   */
  createCompany(): void {
    this.createFormSubmitted.set(true);

    if (!this.validateCreateForm()) {
      return;
    }

    const form = this.createForm();

    this.companyService.create(form).subscribe({
      next: newCompany => {
        this.snackBar.open(
          this.translate.instant('COMPANIES.CREATE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.closeCreateModal();
        this.router.navigate(['/companies', newCompany.id]);
      },
      error: (err: unknown) => {
        console.error('Error creating company:', err);
        this.snackBar.open(
          this.translate.instant('COMPANIES.CREATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }

  /**
   * Validates the create company form.
   * @returns true if form is valid, false otherwise
   */
  private validateCreateForm(): boolean {
    const form = this.createForm();
    const errors: CreateCompanyFormErrors = {
      name: '',
      website: '',
      industry: '',
      location: '',
      employees: '',
    };

    // Validate name (required)
    if (!form.name.trim()) {
      errors.name = this.translate.instant('VALIDATION.NAME_REQUIRED');
    } else if (form.name.trim().length < 2) {
      errors.name = this.translate.instant('VALIDATION.NAME_MIN_LENGTH');
    } else if (form.name.trim().length > 100) {
      errors.name = this.translate.instant('VALIDATION.NAME_MAX_LENGTH');
    }

    // Validate website (optional but must be valid URL if provided)
    if (form.website && form.website.trim()) {
      const urlPattern = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/;
      if (!urlPattern.test(form.website.trim())) {
        errors.website = this.translate.instant('VALIDATION.INVALID_URL');
      }
    }

    this.createFormErrors.set(errors);

    // Return true if no errors
    return (
      !errors.name && !errors.website && !errors.industry && !errors.location && !errors.employees
    );
  }

  /**
   * Opens the investigate company modal.
   */
  openInvestigateModal(): void {
    this.investigateForm.set({
      name: '',
      country: 'USA',
      website: '',
    });
    this.showInvestigateModal.set(true);
  }

  /**
   * Closes the investigate company modal.
   */
  closeInvestigateModal(): void {
    this.showInvestigateModal.set(false);
  }

  /**
   * Initiates company investigation via Prospecting Engine.
   */
  investigateCompany(): void {
    const form = this.investigateForm();
    if (!form.name.trim()) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.NAME_REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }
    if (!form.country) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.COUNTRY_REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.companyService.investigate(form).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('COMPANIES.INVESTIGATE_STARTED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 5000 }
        );
        this.closeInvestigateModal();
        this.loadCompanies();
      },
      error: (err: unknown) => {
        console.error('Error investigating company:', err);
        this.snackBar.open(
          this.translate.instant('COMPANIES.INVESTIGATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }

  /**
   * Updates create form field.
   */
  updateCreateForm(
    field: keyof CreateCompanyDto,
    value: CreateCompanyDto[keyof CreateCompanyDto]
  ): void {
    this.createForm.update(form => ({ ...form, [field]: value }));
  }

  /**
   * Updates investigate form field.
   */
  updateInvestigateForm(
    field: keyof InvestigateCompanyDto,
    value: InvestigateCompanyDto[keyof InvestigateCompanyDto]
  ): void {
    this.investigateForm.update(form => ({ ...form, [field]: value }));
  }

  /**
   * Gets industry label for display.
   */
  getIndustryLabel(industry?: string): string {
    if (!industry) return '-';
    const option = this.industryOptions.find(o => o.value === industry);
    return option ? this.translate.instant(option.labelKey) : industry;
  }

  /**
   * Handles modal overlay click (close on backdrop click).
   */
  onModalOverlayClick(event: MouseEvent, modalType: 'create' | 'investigate'): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      if (modalType === 'create') {
        this.closeCreateModal();
      } else {
        this.closeInvestigateModal();
      }
    }
  }

  /**
   * Handles keyboard events for modal (close on ESC).
   */
  onModalKeydown(event: KeyboardEvent, modalType: 'create' | 'investigate'): void {
    if (event.key === 'Escape') {
      if (modalType === 'create') {
        this.closeCreateModal();
      } else {
        this.closeInvestigateModal();
      }
    }
  }
}
