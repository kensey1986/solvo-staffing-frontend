import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
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
  Industry,
  CompanySize,
} from '@core';
import { CompanyPipelineBadgeComponent, RelationshipTypeBadgeComponent } from '@shared';

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
  ],
  providers: [COMPANY_SERVICE_PROVIDER],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesListComponent implements OnInit {
  private readonly companyService = inject(COMPANY_SERVICE);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

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
    'actions',
  ];

  // Filter options
  readonly relationshipTypeOptions: { value: CompanyRelationshipType | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'client', label: 'Cliente' },
    { value: 'prospect', label: 'Prospecto' },
    { value: 'lead', label: 'Lead' },
    { value: 'inactive', label: 'Inactivo' },
  ];

  readonly pipelineOptions: { value: CompanyPipelineStage | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'engaged', label: 'Engaged' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'client', label: 'Client' },
    { value: 'lost', label: 'Lost' },
  ];

  readonly industryOptions: { value: Industry | ''; label: string }[] = [
    { value: '', label: 'Seleccionar...' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'financial_services', label: 'Financial Services' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'energy', label: 'Energy' },
    { value: 'education', label: 'Education' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'construction', label: 'Construction' },
    { value: 'other', label: 'Other' },
  ];

  readonly employeeSizeOptions: { value: CompanySize | ''; label: string }[] = [
    { value: '', label: 'Seleccionar...' },
    { value: '1-50', label: '1-50' },
    { value: '50-100', label: '50-100' },
    { value: '100-200', label: '100-200' },
    { value: '200-500', label: '200-500' },
    { value: '500-1000', label: '500-1000' },
    { value: '1000-5000', label: '1000-5000' },
    { value: '5000+', label: '5000+' },
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
    const total = this.totalItems();
    if (total === 0) return 'No companies found';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Mostrando ${start.toLocaleString()}-${end.toLocaleString()} de ${total.toLocaleString()}`;
  });

  ngOnInit(): void {
    this.loadCompanies();
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
    };

    this.companyService.getAll(params).subscribe({
      next: (response: PaginatedResponse<Company>) => {
        this.companies.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading companies:', err);
        this.snackBar.open('Error al cargar empresas', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Empresa creada exitosamente', 'Cerrar', { duration: 3000 });
        this.closeCreateModal();
        this.router.navigate(['/companies', newCompany.id]);
      },
      error: (err: unknown) => {
        console.error('Error creating company:', err);
        this.snackBar.open('Error al crear empresa', 'Cerrar', { duration: 3000 });
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
      errors.name = 'El nombre de la empresa es requerido';
    } else if (form.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (form.name.trim().length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validate website (optional but must be valid URL if provided)
    if (form.website && form.website.trim()) {
      const urlPattern = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/;
      if (!urlPattern.test(form.website.trim())) {
        errors.website = 'Ingrese una URL válida (ej: https://ejemplo.com)';
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
      this.snackBar.open('El nombre es requerido', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!form.country) {
      this.snackBar.open('El país es requerido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.companyService.investigate(form).subscribe({
      next: () => {
        this.snackBar.open('Investigación iniciada. Tiempo estimado: ~5 min', 'Cerrar', {
          duration: 5000,
        });
        this.closeInvestigateModal();
        this.loadCompanies();
      },
      error: (err: unknown) => {
        console.error('Error investigating company:', err);
        this.snackBar.open('Error al iniciar investigación', 'Cerrar', { duration: 3000 });
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
    return option?.label || industry;
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
