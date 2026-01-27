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

import { Company, SeniorityLevel, SENIORITY_LEVEL_LABELS, COMPANY_SERVICE } from '@core';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

/**
 * Form data for creating a new vacancy.
 */
export interface CreateVacancyFormData {
  jobTitle: string;
  companyId: number | null;
  location: string;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  salaryRange: string;
}

/**
 * Validation errors for form fields.
 */
export interface CreateVacancyFormErrors {
  jobTitle: string | null;
  companyId: string | null;
  location: string | null;
  salaryRange: string | null;
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
            <h2 id="create-vacancy-title" class="modal-title">Nueva Vacante</h2>
            <button mat-icon-button (click)="close()" aria-label="Cerrar modal">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form (ngSubmit)="submit()">
              <!-- Job Title -->
              <div class="form-field">
                <label class="form-label" for="create-title">Título del Puesto *</label>
                <input
                  id="create-title"
                  type="text"
                  class="form-input"
                  [class.input-error]="submitted() && formErrors().jobTitle"
                  [(ngModel)]="formData.jobTitle"
                  name="jobTitle"
                  required
                  placeholder="Ej: Senior Software Engineer"
                  (ngModelChange)="validateForm()"
                />
                @if (submitted() && formErrors().jobTitle) {
                  <span class="error-message">{{ formErrors().jobTitle }}</span>
                }
              </div>

              <!-- Company -->
              <div class="form-field">
                <label class="form-label" for="create-company">Empresa *</label>
                @if (loadingCompanies()) {
                  <div class="loading-select">
                    <mat-spinner diameter="20"></mat-spinner>
                    <span>Cargando empresas...</span>
                  </div>
                } @else {
                  <mat-select
                    id="create-company"
                    class="form-select"
                    [class.select-error]="submitted() && formErrors().companyId"
                    [(ngModel)]="formData.companyId"
                    name="companyId"
                    required
                    placeholder="Seleccione una empresa"
                    (ngModelChange)="validateForm()"
                  >
                    @for (company of companies(); track company.id) {
                      <mat-option [value]="company.id">
                        {{ company.name }}
                      </mat-option>
                    }
                  </mat-select>
                  @if (submitted() && formErrors().companyId) {
                    <span class="error-message">{{ formErrors().companyId }}</span>
                  }
                }
              </div>

              <!-- Location + Department Row -->
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label" for="create-location">Ubicación</label>
                  <input
                    id="create-location"
                    type="text"
                    class="form-input"
                    [class.input-error]="submitted() && formErrors().location"
                    [(ngModel)]="formData.location"
                    name="location"
                    placeholder="Ciudad, Estado"
                    (ngModelChange)="validateForm()"
                  />
                  @if (submitted() && formErrors().location) {
                    <span class="error-message">{{ formErrors().location }}</span>
                  }
                </div>
                <div class="form-field">
                  <label class="form-label" for="create-department">Departamento</label>
                  <input
                    id="create-department"
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.department"
                    name="department"
                    placeholder="Ej: Engineering"
                  />
                </div>
              </div>

              <!-- Seniority + Salary Row -->
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label" for="create-seniority">Nivel de Seniority</label>
                  <mat-select
                    id="create-seniority"
                    class="form-select"
                    [(ngModel)]="formData.seniorityLevel"
                    name="seniorityLevel"
                  >
                    <mat-option value="">Sin especificar</mat-option>
                    @for (option of seniorityOptions(); track option.value) {
                      <mat-option [value]="option.value">
                        {{ option.label }}
                      </mat-option>
                    }
                  </mat-select>
                </div>
                <div class="form-field">
                  <label class="form-label" for="create-salary">Rango Salarial</label>
                  <input
                    id="create-salary"
                    type="text"
                    class="form-input"
                    [class.input-error]="submitted() && formErrors().salaryRange"
                    [(ngModel)]="formData.salaryRange"
                    name="salaryRange"
                    placeholder="Ej: $80,000 - $100,000"
                    (ngModelChange)="validateForm()"
                  />
                  @if (submitted() && formErrors().salaryRange) {
                    <span class="error-message">{{ formErrors().salaryRange }}</span>
                  }
                </div>
              </div>

              <!-- Info Note -->
              <div class="info-note">
                <p>
                  La vacante se creará con: <strong>source = 'manual'</strong>,
                  <strong>status = 'active'</strong>, <strong>pipeline = 'detected'</strong>
                </p>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <app-custom-button
              label="Cancelar"
              variant="secondary"
              [type]="'button'"
              (buttonClick)="close()"
            />
            <app-custom-button
              label="Crear Vacante"
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
      max-width: 550px;
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

  /** Whether form is valid */
  readonly isValid = signal(false);

  /** Form validation errors */
  readonly formErrors = signal<CreateVacancyFormErrors>({
    jobTitle: null,
    companyId: null,
    location: null,
    salaryRange: null,
  });

  /** Whether form has been submitted (to show errors only after submit attempt) */
  readonly submitted = signal(false);

  constructor() {
    // Effect to reset form, load companies, and lock body scroll when modal opens
    effect(() => {
      if (this.isOpen()) {
        this.formData = this.getDefaultFormData();
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
      salaryRange: null,
    };

    // Job Title validation (required, min 3 chars, valid characters)
    const title = this.formData.jobTitle.trim();
    if (!title) {
      errors.jobTitle = 'El título es requerido';
    } else if (title.length < 3) {
      errors.jobTitle = 'El título debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9\s\-/.,()+&]+$/.test(title)) {
      errors.jobTitle = 'El título contiene caracteres no válidos';
    }

    // Company validation (required)
    if (!this.formData.companyId || this.formData.companyId <= 0) {
      errors.companyId = 'Debe seleccionar una empresa';
    }

    // Location validation (optional, but if provided must be valid format)
    const location = this.formData.location.trim();
    if (location && !/^[a-zA-Z\s,.\-áéíóúÁÉÍÓÚñÑ]+$/.test(location)) {
      errors.location = 'La ubicación contiene caracteres no válidos';
    }

    // Salary Range validation (optional, but if provided must match pattern)
    const salary = this.formData.salaryRange.trim();
    if (salary && !/^[$\d,.\s\-kKmM]+$/.test(salary)) {
      errors.salaryRange = 'Formato inválido (ej: $80,000 - $100,000)';
    }

    this.formErrors.set(errors);
    this.isValid.set(
      !errors.jobTitle && !errors.companyId && !errors.location && !errors.salaryRange
    );
  }

  /**
   * Returns default form data.
   */
  private getDefaultFormData(): CreateVacancyFormData {
    return {
      jobTitle: '',
      companyId: null,
      location: '',
      department: '',
      seniorityLevel: '',
      salaryRange: '',
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
      location: this.formData.location.trim(),
      department: this.formData.department.trim(),
      salaryRange: this.formData.salaryRange.trim(),
    });
  }
}
