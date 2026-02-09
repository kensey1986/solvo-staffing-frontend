import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Company,
  SeniorityLevel,
  WorkModality,
  SENIORITY_LEVEL_LABELS,
  COMPANY_SERVICE,
} from '@core';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

/** US States for location datalist */
const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
  'Remote',
] as const;

/** Department options */
const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Sales',
  'Operations',
  'HR',
  'Finance',
  'Marketing',
] as const;

/** Work modality labels */
const WORK_MODALITY_LABELS: Record<WorkModality | 'unknown', string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  on_site: 'On-site',
  unknown: 'Unknown',
};

/**
 * Form data for creating a new vacancy.
 */
export interface CreateVacancyFormData {
  jobTitle: string;
  companyId: number | null;
  description: string;
  location: string;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  workModality: WorkModality | 'unknown' | '';
  isRemoteViable: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  jobUrl: string;
  publishedDate: string;
  notes: string;
}

/**
 * Validation errors for form fields.
 */
export interface CreateVacancyFormErrors {
  jobTitle: string | null;
  companyId: string | null;
  location: string | null;
  salary: string | null;
}

/**
 * CreateVacancyModalComponent
 *
 * Modal component for creating new vacancies.
 * Follows the same pattern as EditVacancyModalComponent.
 *
 * @example
 * ```html
 * <app-create-vacancy-modal
 *   [isOpen]="showCreateModal()"
 *   (submitCreate)="onCreateSubmit($event)"
 *   (closeModal)="closeCreateModal()"
 * />
 * ```
 */
@Component({
  selector: 'app-create-vacancy-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    TranslateModule,
    CustomButtonComponent,
  ],
  template: `
    @if (isOpen()) {
      <div
        class="modal-overlay"
        (click)="onOverlayClick()"
        (keydown.escape)="close()"
        tabindex="0"
        role="button"
      >
        <div
          class="modal-container"
          (click)="$event.stopPropagation()"
          (keydown.escape)="close()"
          tabindex="0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-vacancy-title"
        >
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 id="create-vacancy-title" class="modal-title">
              {{ 'CREATE_VACANCY_MODAL.TITLE' | translate }}
            </h2>
            <button
              mat-icon-button
              (click)="close()"
              [attr.aria-label]="'CREATE_VACANCY_MODAL.CLOSE' | translate"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form (ngSubmit)="submit()">
              <!-- Section: Basic Information -->
              <div class="form-section">
                <h3 class="section-title">
                  {{ 'CREATE_VACANCY_MODAL.SECTION_BASIC' | translate }}
                </h3>

                <!-- Job Title -->
                <div class="form-field">
                  <label class="form-label" for="create-title">{{
                    'CREATE_VACANCY_MODAL.JOB_TITLE_LABEL' | translate
                  }}</label>
                  <input
                    id="create-title"
                    type="text"
                    class="form-input"
                    [class.input-error]="submitted() && formErrors().jobTitle"
                    [(ngModel)]="formData.jobTitle"
                    name="jobTitle"
                    required
                    [placeholder]="'CREATE_VACANCY_MODAL.JOB_TITLE_PLACEHOLDER' | translate"
                    (ngModelChange)="validateForm()"
                  />
                  @if (submitted() && formErrors().jobTitle) {
                    <span class="error-message">{{ formErrors().jobTitle }}</span>
                  }
                </div>

                <!-- Company -->
                <div class="form-field">
                  <label class="form-label" for="create-company">{{
                    'CREATE_VACANCY_MODAL.COMPANY_LABEL' | translate
                  }}</label>
                  @if (loadingCompanies()) {
                    <div class="loading-select">
                      <mat-spinner diameter="20"></mat-spinner>
                      <span>{{ 'CREATE_VACANCY_MODAL.LOADING_COMPANIES' | translate }}</span>
                    </div>
                  } @else {
                    <input
                      id="create-company-search"
                      type="text"
                      class="form-input"
                      [class.input-error]="submitted() && formErrors().companyId"
                      [(ngModel)]="companySearchText"
                      name="companySearch"
                      [placeholder]="'CREATE_VACANCY_MODAL.SEARCH_COMPANY' | translate"
                      list="companies-list"
                      (ngModelChange)="onCompanySearchChange($event)"
                      autocomplete="off"
                    />
                    <datalist id="companies-list">
                      @for (company of filteredCompanies(); track company.id) {
                        <option [value]="company.name"></option>
                      }
                    </datalist>
                    @if (submitted() && formErrors().companyId) {
                      <span class="error-message">{{ formErrors().companyId }}</span>
                    }
                  }
                </div>

                <!-- Job Description -->
                <div class="form-field">
                  <label class="form-label" for="create-description">{{
                    'CREATE_VACANCY_MODAL.DESCRIPTION_LABEL' | translate
                  }}</label>
                  <textarea
                    id="create-description"
                    class="form-textarea"
                    rows="3"
                    [(ngModel)]="formData.description"
                    name="description"
                    [placeholder]="'CREATE_VACANCY_MODAL.DESCRIPTION_PLACEHOLDER' | translate"
                  ></textarea>
                </div>

                <!-- Location + Department Row -->
                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label" for="create-location">{{
                      'CREATE_VACANCY_MODAL.LOCATION_LABEL' | translate
                    }}</label>
                    <input
                      id="create-location"
                      type="text"
                      class="form-input"
                      [class.input-error]="submitted() && formErrors().location"
                      [(ngModel)]="formData.location"
                      name="location"
                      list="us-states-list"
                      [placeholder]="'CREATE_VACANCY_MODAL.LOCATION_PLACEHOLDER' | translate"
                      (ngModelChange)="validateForm()"
                    />
                    <datalist id="us-states-list">
                      @for (state of usStates; track state) {
                        <option [value]="state"></option>
                      }
                    </datalist>
                    @if (submitted() && formErrors().location) {
                      <span class="error-message">{{ formErrors().location }}</span>
                    }
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="create-department">{{
                      'CREATE_VACANCY_MODAL.DEPARTMENT_LABEL' | translate
                    }}</label>
                    <mat-select
                      id="create-department"
                      class="form-select"
                      [(ngModel)]="formData.department"
                      name="department"
                    >
                      <mat-option value="">{{
                        'CREATE_VACANCY_MODAL.SELECT' | translate
                      }}</mat-option>
                      @for (dept of departmentOptions; track dept) {
                        <mat-option [value]="dept">{{ dept }}</mat-option>
                      }
                    </mat-select>
                  </div>
                </div>

                <!-- Seniority Level -->
                <div class="form-field">
                  <label class="form-label" for="create-seniority">{{
                    'CREATE_VACANCY_MODAL.SENIORITY_LABEL' | translate
                  }}</label>
                  <mat-select
                    id="create-seniority"
                    class="form-select"
                    [(ngModel)]="formData.seniorityLevel"
                    name="seniorityLevel"
                  >
                    <mat-option value="">{{
                      'CREATE_VACANCY_MODAL.SELECT' | translate
                    }}</mat-option>
                    @for (option of seniorityOptions(); track option.value) {
                      <mat-option [value]="option.value">
                        {{ option.label }}
                      </mat-option>
                    }
                  </mat-select>
                </div>
              </div>

              <!-- Section: Work Type -->
              <div class="form-section">
                <h3 class="section-title">
                  {{ 'CREATE_VACANCY_MODAL.SECTION_WORK_TYPE' | translate }}
                </h3>

                <div class="form-field">
                  <label class="form-label" for="create-modality">{{
                    'CREATE_VACANCY_MODAL.MODALITY_LABEL' | translate
                  }}</label>
                  <mat-select
                    id="create-modality"
                    class="form-select"
                    [(ngModel)]="formData.workModality"
                    name="workModality"
                  >
                    <mat-option value="">{{
                      'CREATE_VACANCY_MODAL.SELECT' | translate
                    }}</mat-option>
                    @for (option of modalityOptions(); track option.value) {
                      <mat-option [value]="option.value">
                        {{ option.label }}
                      </mat-option>
                    }
                  </mat-select>
                </div>

                <div class="form-field checkbox-field">
                  <mat-checkbox [(ngModel)]="formData.isRemoteViable" name="isRemoteViable">
                    {{ 'CREATE_VACANCY_MODAL.REMOTE_VIABLE' | translate }}
                  </mat-checkbox>
                </div>
              </div>

              <!-- Section: Compensation -->
              <div class="form-section">
                <h3 class="section-title">
                  {{ 'CREATE_VACANCY_MODAL.SECTION_COMPENSATION' | translate }}
                </h3>

                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label" for="create-salary-min">{{
                      'CREATE_VACANCY_MODAL.SALARY_MIN_LABEL' | translate
                    }}</label>
                    <input
                      id="create-salary-min"
                      type="number"
                      class="form-input"
                      [class.input-error]="submitted() && formErrors().salary"
                      [(ngModel)]="formData.salaryMin"
                      name="salaryMin"
                      [placeholder]="'CREATE_VACANCY_MODAL.SALARY_MIN_PLACEHOLDER' | translate"
                      min="0"
                      (ngModelChange)="validateForm()"
                    />
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="create-salary-max">{{
                      'CREATE_VACANCY_MODAL.SALARY_MAX_LABEL' | translate
                    }}</label>
                    <input
                      id="create-salary-max"
                      type="number"
                      class="form-input"
                      [class.input-error]="submitted() && formErrors().salary"
                      [(ngModel)]="formData.salaryMax"
                      name="salaryMax"
                      [placeholder]="'CREATE_VACANCY_MODAL.SALARY_MAX_PLACEHOLDER' | translate"
                      min="0"
                      (ngModelChange)="validateForm()"
                    />
                    @if (submitted() && formErrors().salary) {
                      <span class="error-message">{{ formErrors().salary }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Section: Source Information -->
              <div class="form-section">
                <h3 class="section-title">
                  {{ 'CREATE_VACANCY_MODAL.SECTION_SOURCE' | translate }}
                </h3>

                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label" for="create-job-url">{{
                      'CREATE_VACANCY_MODAL.URL_LABEL' | translate
                    }}</label>
                    <input
                      id="create-job-url"
                      type="url"
                      class="form-input"
                      [(ngModel)]="formData.jobUrl"
                      name="jobUrl"
                      placeholder="https://..."
                    />
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="create-published-date">{{
                      'CREATE_VACANCY_MODAL.PUBLISHED_DATE_LABEL' | translate
                    }}</label>
                    <input
                      id="create-published-date"
                      type="date"
                      class="form-input"
                      [(ngModel)]="formData.publishedDate"
                      name="publishedDate"
                    />
                  </div>
                </div>
              </div>

              <!-- Section: Notes -->
              <div
                class="form-section"
                style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;"
              >
                <h3 class="section-title">
                  {{ 'CREATE_VACANCY_MODAL.SECTION_NOTES' | translate }}
                </h3>

                <div class="form-field">
                  <textarea
                    id="create-notes"
                    class="form-textarea"
                    rows="2"
                    [(ngModel)]="formData.notes"
                    name="notes"
                    [placeholder]="'CREATE_VACANCY_MODAL.NOTES_PLACEHOLDER' | translate"
                  ></textarea>
                </div>
              </div>

              <!-- Info Note -->
              <div class="info-note">
                <p>
                  {{ 'CREATE_VACANCY_MODAL.INFO_NOTE' | translate }}
                  <strong>source = 'manual'</strong>, <strong>status = 'active'</strong>,
                  <strong>pipeline = 'detected'</strong>
                </p>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <app-custom-button
              [label]="'CREATE_VACANCY_MODAL.CANCEL' | translate"
              variant="secondary"
              [type]="'button'"
              (buttonClick)="close()"
            />
            <app-custom-button
              [label]="'CREATE_VACANCY_MODAL.CREATE' | translate"
              variant="primary"
              [type]="'submit'"
              [disabled]="!isValid()"
              (buttonClick)="submit()"
            />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      animation: fadeIn 0.2s ease-out;
      overflow: hidden;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background-color: var(--mat-sys-surface-container-high);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      overscroll-behavior: contain;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .form-field {
      margin-bottom: 20px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    .form-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);

      &:last-of-type {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin: 0 0 16px 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .form-field {
        margin-bottom: 20px;
      }
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--mat-sys-on-surface);
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.7;
      }
    }

    .form-textarea {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--mat-sys-on-surface);
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
      resize: vertical;
      min-height: 60px;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.7;
      }
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      margin-top: 8px;
    }

    .form-select {
      width: 100%;

      ::ng-deep {
        .mat-mdc-select-trigger {
          padding: 12px;
          background-color: var(--mat-sys-surface-container);
          border: 1px solid var(--mat-sys-outline-variant);
          border-radius: 8px;
        }
      }
    }

    .loading-select {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
    }

    .info-note {
      background-color: var(--mat-sys-surface-container-highest);
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 8px;

      p {
        margin: 0;
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.5;
      }

      strong {
        color: var(--mat-sys-on-surface);
      }
    }

    .form-input.input-error {
      border-color: var(--mat-sys-error, #b00020);
    }

    .form-select.select-error ::ng-deep .mat-mdc-select-trigger {
      border-color: var(--mat-sys-error, #b00020);
    }

    .error-message {
      display: block;
      font-size: 11px;
      color: var(--mat-sys-error, #b00020);
      margin-top: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVacancyModalComponent implements OnDestroy {
  private readonly companyService = inject(COMPANY_SERVICE);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  /** Whether the modal is open */
  readonly isOpen = input<boolean>(false);

  /** Whether clicking overlay closes the modal */
  readonly closeOnOverlay = input<boolean>(true);

  /** Emits form data on submit */
  readonly submitCreate = output<CreateVacancyFormData>();

  /** Emits when modal should close */
  readonly closeModal = output<void>();

  /** Internal form data */
  formData: CreateVacancyFormData = this.getDefaultFormData();

  /** Companies for dropdown */
  readonly companies = signal<Company[]>([]);

  /** Loading companies state */
  readonly loadingCompanies = signal(false);

  /** Seniority options for select */
  readonly seniorityOptions = computed(() =>
    (Object.entries(SENIORITY_LEVEL_LABELS) as [SeniorityLevel, string][]).map(
      ([value, label]) => ({
        value,
        label,
      })
    )
  );

  /** Work modality options for select */
  readonly modalityOptions = computed(() =>
    (Object.entries(WORK_MODALITY_LABELS) as [WorkModality, string][]).map(([value, label]) => ({
      value,
      label,
    }))
  );

  /** US States for location dropdown */
  readonly usStates = US_STATES;

  /** Department options for dropdown */
  readonly departmentOptions = DEPARTMENT_OPTIONS;

  /** Company search text binding */
  companySearchText = '';

  /** Filtered companies based on search */
  readonly filteredCompanies = computed(() => {
    const search = this.companySearchText.toLowerCase();
    if (!search) return this.companies();
    return this.companies().filter(c => c.name.toLowerCase().includes(search));
  });

  /** Whether form is valid */
  readonly isValid = signal(false);

  /** Form validation errors */
  readonly formErrors = signal<CreateVacancyFormErrors>({
    jobTitle: null,
    companyId: null,
    location: null,
    salary: null,
  });

  /** Whether form has been submitted (to show errors only after submit attempt) */
  readonly submitted = signal(false);

  constructor() {
    // Effect to reset form, load companies, and lock body scroll when modal opens
    effect(() => {
      if (this.isOpen()) {
        this.formData = this.getDefaultFormData();
        this.companySearchText = '';
        this.submitted.set(false);
        this.validateForm();
        this.loadCompanies();
        this.lockBodyScroll();
      } else {
        this.unlockBodyScroll();
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  /**
   * Locks body scroll when modal is open.
   */
  private lockBodyScroll(): void {
    this.document.body.style.overflow = 'hidden';
  }

  /**
   * Unlocks body scroll when modal is closed.
   */
  private unlockBodyScroll(): void {
    this.document.body.style.overflow = '';
  }

  /**
   * Loads companies for the dropdown.
   */
  private loadCompanies(): void {
    if (this.companies().length > 0) return;

    this.loadingCompanies.set(true);
    this.companyService.getAll({ pageSize: 1000 }).subscribe({
      next: response => {
        this.companies.set(response.data);
        this.loadingCompanies.set(false);
      },
      error: err => {
        console.error('Error loading companies:', err);
        this.loadingCompanies.set(false);
      },
    });
  }

  /**
   * Validates the form and updates isValid signal.
   */
  validateForm(): void {
    const errors: CreateVacancyFormErrors = {
      jobTitle: null,
      companyId: null,
      location: null,
      salary: null,
    };

    // Job Title validation (required, min 3 chars, valid characters)
    const title = this.formData.jobTitle.trim();
    if (!title) {
      errors.jobTitle = this.translate.instant('CREATE_VACANCY_MODAL.TITLE_REQUIRED');
    } else if (title.length < 3) {
      errors.jobTitle = this.translate.instant('CREATE_VACANCY_MODAL.TITLE_MIN');
    } else if (!/^[a-zA-Z0-9\s\-/.,()+&]+$/.test(title)) {
      errors.jobTitle = this.translate.instant('CREATE_VACANCY_MODAL.TITLE_INVALID');
    }

    // Company validation (required)
    if (!this.formData.companyId || this.formData.companyId <= 0) {
      errors.companyId = this.translate.instant('CREATE_VACANCY_MODAL.COMPANY_REQUIRED');
    }

    // Location validation (optional, but if provided must be valid format)
    const location = this.formData.location.trim();
    if (location && !/^[a-zA-Z\s,.\-áéíóúÁÉÍÓÚñÑ]+$/.test(location)) {
      errors.location = this.translate.instant('CREATE_VACANCY_MODAL.LOCATION_INVALID');
    }

    // Salary validation (optional, but if max is less than min, show error)
    if (
      this.formData.salaryMin !== null &&
      this.formData.salaryMax !== null &&
      this.formData.salaryMin > 0 &&
      this.formData.salaryMax > 0 &&
      this.formData.salaryMax < this.formData.salaryMin
    ) {
      errors.salary = this.translate.instant('CREATE_VACANCY_MODAL.SALARY_INVALID');
    }

    this.formErrors.set(errors);
    this.isValid.set(!errors.jobTitle && !errors.companyId && !errors.location && !errors.salary);
  }

  /**
   * Returns default form data.
   */
  private getDefaultFormData(): CreateVacancyFormData {
    return {
      jobTitle: '',
      companyId: null,
      description: '',
      location: '',
      department: '',
      seniorityLevel: '',
      workModality: '',
      isRemoteViable: false,
      salaryMin: null,
      salaryMax: null,
      jobUrl: '',
      publishedDate: '',
      notes: '',
    };
  }

  /**
   * Handles overlay click.
   */
  onOverlayClick(): void {
    if (this.closeOnOverlay()) {
      this.close();
    }
  }

  /**
   * Handles company search input change.
   * Updates companyId when a valid company is selected.
   */
  onCompanySearchChange(value: string): void {
    this.companySearchText = value;
    const matchedCompany = this.companies().find(c => c.name.toLowerCase() === value.toLowerCase());
    if (matchedCompany) {
      this.formData.companyId = matchedCompany.id;
    } else {
      this.formData.companyId = null;
    }
    this.validateForm();
  }

  /**
   * Closes the modal.
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Submits the create form.
   */
  submit(): void {
    this.submitted.set(true);
    this.validateForm();
    if (!this.isValid()) return;

    this.submitCreate.emit({
      ...this.formData,
      jobTitle: this.formData.jobTitle.trim(),
      description: this.formData.description?.trim() || '',
      location: this.formData.location.trim(),
      department: this.formData.department.trim(),
      jobUrl: this.formData.jobUrl?.trim() || '',
      notes: this.formData.notes?.trim() || '',
    });
  }
}
