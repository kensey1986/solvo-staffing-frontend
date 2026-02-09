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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  CustomButtonComponent,
  ConfirmationModalComponent,
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

interface AddContactForm {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  isPrimary: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
}

const INITIAL_CONTACT_FORM: AddContactForm = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  isPrimary: false,
};

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
    MatCheckboxModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    CompanyPipelineBadgeComponent,
    StateChangeModalComponent,
    CustomButtonComponent,
    ConfirmationModalComponent,
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
  private readonly translate = inject(TranslateService);

  /** Loading states */
  readonly isLoading = signal(true);

  /** Company data */
  readonly company = signal<Company | null>(null);
  readonly stateHistory = signal<CompanyStateChange[]>([]);
  readonly vacancies = signal<Vacancy[]>([]);

  /** Tracking tab filters */
  readonly trackingFilterDateFrom = signal<Date | null>(null);
  readonly trackingFilterDateTo = signal<Date | null>(null);
  readonly trackingFilterUser = signal<string>('');
  readonly trackingFilterState = signal<string>('');

  /** Unique users from state history */
  readonly trackingUsers = computed(() => {
    const users = this.stateHistory().map(h => h.user);
    return [...new Set(users)].sort();
  });

  /** Unique pipeline stages from state history */
  readonly trackingStages = computed(() => {
    const stages = new Set<CompanyPipelineStage>();
    this.stateHistory().forEach(h => {
      if (h.fromState) stages.add(h.fromState);
      if (h.toState) stages.add(h.toState);
    });
    return [...stages];
  });

  /** Filtered state history based on filters */
  readonly filteredStateHistory = computed(() => {
    let history = this.stateHistory();
    const dateFrom = this.trackingFilterDateFrom();
    const dateTo = this.trackingFilterDateTo();
    const user = this.trackingFilterUser();
    const state = this.trackingFilterState();

    if (dateFrom) {
      history = history.filter(h => new Date(h.date) >= dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      history = history.filter(h => new Date(h.date) <= endOfDay);
    }
    if (user) {
      history = history.filter(h => h.user === user);
    }
    if (state) {
      history = history.filter(h => h.fromState === state || h.toState === state);
    }
    return history;
  });

  /** Tab state */
  readonly selectedTabIndex = signal(0);

  /** Computed company ID from route */
  readonly companyId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  /** Page title computed from company name */
  readonly pageTitle = computed(() => this.company()?.name || 'Company Detail');

  goToCompanies(): void {
    this.router.navigate(['/companies']);
  }

  /** Industry label */
  readonly industryLabel = computed(() => {
    const ind = this.company()?.industry;
    return ind ? INDUSTRY_LABELS[ind] : 'N/A';
  });

  /** Size label */
  readonly sizeLabel = computed(() => {
    const size = this.company()?.employees;
    if (!size) return 'N/A';
    if (typeof size === 'number') return size.toLocaleString();
    return COMPANY_SIZE_LABELS[size];
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

  /** Assign modal state */
  readonly showAssignModal = signal(false);
  readonly isAssigning = signal(false);

  /** Computed message for assign modal */
  readonly assignMessage = computed(() => {
    const comp = this.company();
    if (!comp) return '';
    return (
      this.translate.instant('COMPANY_DETAIL.CONFIRM_ASSIGN_MSG') +
      `<br/><strong>${comp.name}</strong>`
    );
  });

  /** Add contact modal state */
  readonly showAddContactModal = signal(false);
  readonly contactForm = signal<AddContactForm>({ ...INITIAL_CONTACT_FORM });
  readonly contactFormErrors = signal<FormErrors>({});
  readonly isSavingContact = signal(false);

  readonly isContactFormValid = computed(() => {
    const errors = this.validateContactForm(this.contactForm());
    return Object.keys(errors).length === 0;
  });

  /** Edit contact inline state */
  readonly editingContactId = signal<number | null>(null);
  readonly editContactForm = signal<AddContactForm>({ ...INITIAL_CONTACT_FORM });
  readonly editContactFormErrors = signal<FormErrors>({});
  readonly isSavingEditContact = signal(false);

  readonly isEditContactFormValid = computed(() => {
    const errors = this.validateContactForm(this.editContactForm());
    return Object.keys(errors).length === 0;
  });

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
        this.snackBar.open(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
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
        this.snackBar.open(
          this.translate.instant('EDIT_COMPANY.SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
      error: err => {
        console.error('Error updating company:', err);
        this.snackBar.open(
          this.translate.instant('EDIT_COMPANY.ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
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
        this.snackBar.open(
          this.translate.instant('EDIT_RESEARCH.SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
      error: err => {
        console.error('Error updating research:', err);
        this.snackBar.open(
          this.translate.instant('EDIT_RESEARCH.ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
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
        this.snackBar.open(
          this.translate.instant('STATE_CHANGE_MODAL.STATE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
      error: err => {
        console.error('Error changing state:', err);
        this.snackBar.open(
          this.translate.instant('STATE_CHANGE_MODAL.STATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }

  // ============= Commercial Actions =============

  /**
   * Opens the assign confirmation modal.
   */
  assignMe(): void {
    this.showAssignModal.set(true);
  }

  /**
   * Closes the assign confirmation modal.
   */
  closeAssignModal(): void {
    this.showAssignModal.set(false);
  }

  /**
   * Confirms assignment and calls the API.
   */
  confirmAssign(): void {
    const id = this.companyId();
    if (!id) return;

    this.isAssigning.set(true);

    const updateDto = {
      assignedTo: 'Carlos M.', // Mock current user
    };

    this.companyService.update(id, updateDto).subscribe({
      next: updated => {
        this.company.set(updated);
        this.showAssignModal.set(false);
        this.isAssigning.set(false);
        this.snackBar.open(
          this.translate.instant('COMPANY_DETAIL.ASSIGN_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
      error: err => {
        console.error('Error assigning company:', err);
        this.isAssigning.set(false);

        // Handle specific error codes
        const errorKey =
          err?.status === 409
            ? 'COMPANY_DETAIL.ASSIGN_ERROR_CONFLICT'
            : 'COMPANY_DETAIL.ASSIGN_ERROR_NETWORK';

        this.snackBar.open(
          this.translate.instant(errorKey),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
    });
  }

  // ============= Contact Actions =============

  /**
   * Opens the add contact modal.
   */
  openAddContactModal(): void {
    this.resetContactForm();
    this.showAddContactModal.set(true);
  }

  /**
   * Closes the add contact modal.
   */
  closeAddContactModal(): void {
    this.showAddContactModal.set(false);
    this.resetContactForm();
  }

  updateContactField<K extends keyof AddContactForm>(key: K, value: AddContactForm[K]): void {
    this.contactForm.update(form => ({
      ...form,
      [key]: value,
    }));

    if (this.contactFormErrors()[key as keyof FormErrors]) {
      this.contactFormErrors.update(errors => ({
        ...errors,
        [key]: undefined,
      }));
    }
  }

  resetContactForm(): void {
    this.contactForm.set({ ...INITIAL_CONTACT_FORM });
    this.contactFormErrors.set({});
  }

  /**
   * Validates the contact form and returns errors.
   */
  private validateContactForm(form: AddContactForm): FormErrors {
    const errors: FormErrors = {};

    if (!form.fullName.trim()) {
      errors.fullName = this.translate.instant('ADD_CONTACT.ERROR_NAME_REQUIRED');
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = this.translate.instant('ADD_CONTACT.ERROR_EMAIL_INVALID');
      }
    }

    if (form.linkedinUrl.trim()) {
      if (!form.linkedinUrl.toLowerCase().includes('linkedin.com')) {
        errors.linkedinUrl = this.translate.instant('ADD_CONTACT.ERROR_LINKEDIN_INVALID');
      }
    }

    return errors;
  }

  /**
   * Adds a new contact using the company service.
   */
  addContact(): void {
    const form = this.contactForm();
    const errors = this.validateContactForm(form);

    if (Object.keys(errors).length > 0) {
      this.contactFormErrors.set(errors);
      return;
    }

    const companyId = this.company()?.id;
    if (!companyId) {
      return;
    }

    this.isSavingContact.set(true);

    this.companyService
      .createContact(companyId, {
        fullName: form.fullName.trim(),
        jobTitle: form.jobTitle.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        isPrimary: form.isPrimary,
      })
      .subscribe({
        next: newContact => {
          const currentCompany = this.company();
          if (currentCompany) {
            const baseContacts = form.isPrimary
              ? currentCompany.contacts.map(contact => ({
                  ...contact,
                  isPrimary: false,
                }))
              : [...currentCompany.contacts];

            const hasContact = baseContacts.some(contact => contact.id === newContact.id);
            const updatedContacts = hasContact
              ? baseContacts.map(contact =>
                  contact.id === newContact.id ? { ...contact, ...newContact } : contact
                )
              : [...baseContacts, newContact];

            this.company.set({
              ...currentCompany,
              contacts: updatedContacts,
            });
          }

          this.isSavingContact.set(false);
          this.snackBar.open(
            this.translate.instant('ADD_CONTACT.SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
          this.closeAddContactModal();
        },
        error: error => {
          this.isSavingContact.set(false);

          const message =
            error?.code === 'DUPLICATE_EMAIL'
              ? this.translate.instant('ADD_CONTACT.ERROR_DUPLICATE_EMAIL')
              : this.translate.instant('ADD_CONTACT.ERROR');

          this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  // ============= Edit Contact Inline =============

  /**
   * Starts editing a contact inline.
   */
  startEditContact(contact: {
    id: number;
    fullName: string;
    jobTitle: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    isPrimary: boolean;
  }): void {
    this.editingContactId.set(contact.id);
    this.editContactForm.set({
      fullName: contact.fullName,
      jobTitle: contact.jobTitle,
      email: contact.email || '',
      phone: contact.phone || '',
      linkedinUrl: contact.linkedinUrl || '',
      isPrimary: contact.isPrimary,
    });
    this.editContactFormErrors.set({});
  }

  /**
   * Cancels editing a contact.
   */
  cancelEditContact(): void {
    this.editingContactId.set(null);
    this.editContactForm.set({ ...INITIAL_CONTACT_FORM });
    this.editContactFormErrors.set({});
  }

  /**
   * Updates a field in the edit contact form.
   */
  updateEditContactField<K extends keyof AddContactForm>(key: K, value: AddContactForm[K]): void {
    this.editContactForm.update(form => ({
      ...form,
      [key]: value,
    }));

    if (this.editContactFormErrors()[key as keyof FormErrors]) {
      this.editContactFormErrors.update(errors => ({
        ...errors,
        [key]: undefined,
      }));
    }
  }

  /**
   * Saves the edited contact.
   */
  saveEditContact(): void {
    const form = this.editContactForm();
    const errors = this.validateContactForm(form);

    if (Object.keys(errors).length > 0) {
      this.editContactFormErrors.set(errors);
      return;
    }

    const companyId = this.company()?.id;
    const contactId = this.editingContactId();
    if (!companyId || !contactId) {
      return;
    }

    this.isSavingEditContact.set(true);

    this.companyService
      .updateContact(companyId, contactId, {
        fullName: form.fullName.trim(),
        jobTitle: form.jobTitle.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        isPrimary: form.isPrimary,
      })
      .subscribe({
        next: updatedContact => {
          const currentCompany = this.company();
          if (currentCompany) {
            const baseContacts = form.isPrimary
              ? currentCompany.contacts.map(contact => ({
                  ...contact,
                  isPrimary: contact.id === contactId ? true : false,
                }))
              : currentCompany.contacts;

            const updatedContacts = baseContacts.map(contact =>
              contact.id === contactId ? { ...contact, ...updatedContact } : contact
            );

            this.company.set({
              ...currentCompany,
              contacts: updatedContacts,
            });
          }

          this.isSavingEditContact.set(false);
          this.cancelEditContact();
          this.snackBar.open(
            this.translate.instant('EDIT_CONTACT.SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
        },
        error: error => {
          this.isSavingEditContact.set(false);

          const message =
            error?.code === 'DUPLICATE_EMAIL'
              ? this.translate.instant('EDIT_CONTACT.ERROR_DUPLICATE_EMAIL')
              : this.translate.instant('EDIT_CONTACT.ERROR');

          this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /**
   * Formats LinkedIn URL to ensure it has https:// prefix.
   */
  formatLinkedInUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
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
   * Navigates to vacancy detail.
   */
  navigateToVacancy(vacancyId: number): void {
    this.router.navigate(['/vacancies', vacancyId]);
  }
}
