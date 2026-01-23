/**
 * Company Detail Component
 *
 * Displays detailed information about a company including:
 * - General info and contacts
 * - Research data (value proposition, mission, vision, sales pitch)
 * - State history tracking
 * - Associated vacancies
 *
 * Includes modals for editing company, editing research, and changing state.
 */

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';

// Core imports
import {
  Company,
  CompanyPipelineStage,
  CompanyStateChange,
  COMPANY_PIPELINE_LABELS,
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  COUNTRY_LABELS,
} from '../../../../core/models/company.model';
import { Vacancy, PIPELINE_STAGE_LABELS } from '../../../../core/models/vacancy.model';
import { COMPANY_SERVICE, COMPANY_SERVICE_PROVIDER } from '../../../../core/providers';

// Shared components
import {
  StateChangeModalComponent,
  StateOption,
  StateChangeResult,
  CompanyPipelineBadgeComponent,
  RelationshipTypeBadgeComponent,
} from '@shared';

/** Pipeline stage options for state change */
const PIPELINE_STAGES: CompanyPipelineStage[] = [
  'lead',
  'prospecting',
  'engaged',
  'initial_appointment_held',
  'onboarding_started',
  'lost',
];

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    CompanyPipelineBadgeComponent,
    RelationshipTypeBadgeComponent,
    StateChangeModalComponent,
  ],
  providers: [COMPANY_SERVICE_PROVIDER],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss',
})
export class CompanyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(COMPANY_SERVICE);
  private readonly snackBar = inject(MatSnackBar);

  /** Loading states */
  readonly isLoading = signal(true);

  /** Company data */
  readonly company = signal<Company | null>(null);
  readonly stateHistory = signal<CompanyStateChange[]>([]);
  readonly vacancies = signal<Vacancy[]>([]);

  /** Tab state */
  readonly selectedTabIndex = signal(0);

  /** Computed company ID from route */
  readonly companyId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  /** Page title computed from company name */
  readonly pageTitle = computed(() => this.company()?.name || 'Company Detail');

  /** Industry label */
  readonly industryLabel = computed(() => {
    const ind = this.company()?.industry;
    return ind ? INDUSTRY_LABELS[ind] : 'N/A';
  });

  /** Size label */
  readonly sizeLabel = computed(() => {
    const size = this.company()?.employees;
    return size ? COMPANY_SIZE_LABELS[size] : 'N/A';
  });

  /** Country label */
  readonly countryLabel = computed(() => {
    const country = this.company()?.country;
    return country ? COUNTRY_LABELS[country] : 'N/A';
  });

  /** Table columns */
  readonly historyColumns = ['date', 'user', 'change', 'note', 'tags'];
  readonly contactsColumns = ['name', 'title', 'email', 'phone', 'linkedin', 'primary'];
  readonly vacanciesColumns = ['jobTitle', 'location', 'status', 'pipeline', 'date'];

  /** Edit company modal state */
  readonly showEditModal = signal(false);
  readonly editName = signal('');
  readonly editWebsite = signal('');
  readonly editPhone = signal('');
  readonly editLocation = signal('');

  /** Edit research modal state */
  readonly showResearchModal = signal(false);
  readonly editValueProposition = signal('');
  readonly editMission = signal('');
  readonly editVision = signal('');
  readonly editSalesPitch = signal('');

  /** State change modal state */
  readonly showStateModal = signal(false);

  /** Add contact modal state */
  readonly showAddContactModal = signal(false);

  /** State options for state change modal */
  readonly stateOptions = computed<StateOption<CompanyPipelineStage>[]>(() =>
    PIPELINE_STAGES.map(stage => ({
      value: stage,
      label: COMPANY_PIPELINE_LABELS[stage],
    }))
  );

  ngOnInit(): void {
    this.loadCompany();
  }

  /**
   * Loads company data, state history, and associated vacancies.
   */
  private loadCompany(): void {
    const id = this.companyId();
    if (!id) {
      this.router.navigate(['/companies']);
      return;
    }

    this.isLoading.set(true);

    // Load company details
    this.companyService.getById(id).subscribe({
      next: company => {
        this.company.set(company);
        this.isLoading.set(false);
        this.loadStateHistory(id);
        this.loadVacancies(id);
      },
      error: err => {
        console.error('Error loading company:', err);
        this.snackBar.open('Error loading company', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Loads state history for the company.
   */
  private loadStateHistory(companyId: number): void {
    this.companyService.getStateHistory(companyId, {}).subscribe({
      next: history => this.stateHistory.set(history),
      error: err => console.error('Error loading history:', err),
    });
  }

  /**
   * Loads associated vacancies for the company.
   */
  private loadVacancies(companyId: number): void {
    this.companyService.getVacancies(companyId).subscribe({
      next: vacancies => this.vacancies.set(vacancies),
      error: err => console.error('Error loading vacancies:', err),
    });
  }

  // ============= Edit Company Modal =============

  /**
   * Opens the edit company modal.
   */
  openEditModal(): void {
    const comp = this.company();
    if (comp) {
      this.editName.set(comp.name);
      this.editWebsite.set(comp.website || '');
      this.editPhone.set(comp.phone || '');
      this.editLocation.set(comp.location || '');
      this.showEditModal.set(true);
    }
  }

  /**
   * Closes the edit company modal.
   */
  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  /**
   * Saves company changes.
   */
  saveCompany(): void {
    const id = this.companyId();
    if (!id) return;

    const updateDto = {
      name: this.editName(),
      website: this.editWebsite() || undefined,
      phone: this.editPhone() || undefined,
      location: this.editLocation() || undefined,
    };

    this.companyService.update(id, updateDto).subscribe({
      next: updated => {
        this.company.set(updated);
        this.closeEditModal();
        this.snackBar.open('Company updated successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error updating company:', err);
        this.snackBar.open('Error updating company', 'Close', { duration: 3000 });
      },
    });
  }

  // ============= Edit Research Modal =============

  /**
   * Opens the research edit modal.
   */
  openResearchModal(): void {
    const research = this.company()?.research;
    this.editValueProposition.set(research?.valueProposition || '');
    this.editMission.set(research?.mission || '');
    this.editVision.set(research?.vision || '');
    this.editSalesPitch.set(research?.salesPitch || '');
    this.showResearchModal.set(true);
  }

  /**
   * Closes the research edit modal.
   */
  closeResearchModal(): void {
    this.showResearchModal.set(false);
  }

  /**
   * Saves research changes.
   */
  saveResearch(): void {
    const id = this.companyId();
    if (!id) return;

    const updateDto = {
      valueProposition: this.editValueProposition() || undefined,
      mission: this.editMission() || undefined,
      vision: this.editVision() || undefined,
      salesPitch: this.editSalesPitch() || undefined,
    };

    this.companyService.updateResearch(id, updateDto).subscribe({
      next: updatedResearch => {
        const comp = this.company();
        if (comp) {
          this.company.set({ ...comp, research: updatedResearch });
        }
        this.closeResearchModal();
        this.snackBar.open('Research updated successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error updating research:', err);
        this.snackBar.open('Error updating research', 'Close', { duration: 3000 });
      },
    });
  }

  // ============= State Change Modal =============

  /**
   * Opens the state change modal.
   */
  openStateModal(): void {
    if (this.company()) {
      this.showStateModal.set(true);
    }
  }

  /**
   * Closes the state change modal.
   */
  closeStateModal(): void {
    this.showStateModal.set(false);
  }

  /**
   * Handles state change from modal.
   */
  onStateChange(result: StateChangeResult<CompanyPipelineStage | undefined>): void {
    const id = this.companyId();
    if (!id || !result.newState) return;

    const changeDto = {
      newState: result.newState,
      note: result.note,
      tags: result.tags,
    };

    this.companyService.changeState(id, changeDto).subscribe({
      next: updated => {
        this.company.set(updated);
        this.closeStateModal();
        this.loadStateHistory(id);
        this.snackBar.open('State changed successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error changing state:', err);
        this.snackBar.open('Error changing state', 'Close', { duration: 3000 });
      },
    });
  }

  // ============= Commercial Actions =============

  /**
   * Assigns the current company to the logged-in user.
   */
  assignMe(): void {
    const id = this.companyId();
    if (!id) return;

    if (confirm('¿Deseas asignarte esta empresa?')) {
      const updateDto = {
        assignedTo: 'Carlos M.', // Mock current user
      };

      this.companyService.update(id, updateDto).subscribe({
        next: updated => {
          this.company.set(updated);
          this.snackBar.open('Empresa asignada exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: err => {
          console.error('Error assigning company:', err);
          this.snackBar.open('Error al asignar la empresa', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  // ============= Contact Actions =============

  /**
   * Opens the add contact modal.
   */
  openAddContactModal(): void {
    this.showAddContactModal.set(true);
  }

  /**
   * Closes the add contact modal.
   */
  closeAddContactModal(): void {
    this.showAddContactModal.set(false);
  }

  /**
   * Mock implementation of adding a contact.
   */
  addContact(): void {
    this.snackBar.open('Funcionalidad de agregar contacto próximamente', 'Cerrar', {
      duration: 3000,
    });
    this.closeAddContactModal();
  }

  // ============= Utility Methods =============

  /**
   * Formats date for display.
   */
  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Gets pipeline stage label.
   */
  getPipelineLabel(stage: string): string {
    return COMPANY_PIPELINE_LABELS[stage as keyof typeof COMPANY_PIPELINE_LABELS] || stage;
  }

  /**
   * Gets vacancy pipeline stage label.
   */
  getVacancyPipelineLabel(stage: string): string {
    return PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] || stage;
  }

  /**
   * Calculates research completeness percentage.
   */
  getResearchCompleteness(): number {
    return this.company()?.research?.completenessPercent || 0;
  }

  /**
   * Navigates to vacancy detail.
   */
  navigateToVacancy(vacancyId: number): void {
    this.router.navigate(['/vacancies', vacancyId]);
  }
}
