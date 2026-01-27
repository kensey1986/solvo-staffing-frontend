import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  Vacancy,
  SeniorityLevel,
  WorkModality,
  VacancySource,
  SENIORITY_LEVEL_LABELS,
} from '@core';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

/** Department options */
export const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Sales',
  'Operations',
  'HR',
  'Finance',
  'Marketing',
  'Customer Service',
  'Legal',
  'Other',
] as const;

/** Work modality labels */
export const WORK_MODALITY_LABELS: Record<WorkModality | 'unknown', string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  on_site: 'Presencial',
  unknown: 'Desconocido',
};

/** Vacancy source labels */
export const VACANCY_SOURCE_LABELS: Record<VacancySource, string> = {
  indeed: 'Indeed',
  linkedin: 'LinkedIn',
  company_website: 'Company Website',
  manual: 'Manual',
};

/** US States for location datalist */
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'Remote'
] as const;

/**
 * Form data for editing a vacancy.
 */
export interface EditVacancyFormData {
  jobTitle: string;
  description: string;
  location: string;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  workModality: WorkModality | 'unknown' | '';
  isRemoteViable: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  source: VacancySource | '';
  jobUrl: string;
  publishedDate: string;
  notes: string;
}

/**
 * EditVacancyModalComponent
 *
 * Modal component for editing vacancy details.
 * Follows the same pattern as StateChangeModalComponent.
 *
 * @example
 * ```html
 * <app-edit-vacancy-modal
 *   [isOpen]="showEditModal()"
 *   [vacancy]="vacancy()"
 *   (submitEdit)="onEditSubmit($event)"
 *   (closeModal)="closeEditModal()"
 * />
 * ```
 */
@Component({
  selector: 'app-edit-vacancy-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
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
          aria-labelledby="edit-vacancy-title"
        >
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2 id="edit-vacancy-title" class="modal-title">Editar Vacante</h2>
              @if (modifiedFieldsCount() > 0) {
                <span class="modified-badge">{{ modifiedFieldsCount() }} campos modificados</span>
              }
            </div>
            <button mat-icon-button (click)="close()" aria-label="Cerrar modal">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form (ngSubmit)="submit()">
              <!-- Section: Información Básica -->
              <div class="form-section">
                <h3 class="section-title">Información Básica</h3>

                <!-- Job Title -->
                <div class="form-field" [class.field-modified]="isFieldModified('jobTitle')">
                  <label class="form-label" for="edit-title">Título del Puesto *</label>
                  <input
                    id="edit-title"
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.jobTitle"
                    name="jobTitle"
                    required
                    placeholder="Ej: Senior Software Engineer"
                    (ngModelChange)="onFieldChange()"
                  />
                </div>

                <!-- Description -->
                <div class="form-field" [class.field-modified]="isFieldModified('description')">
                  <label class="form-label" for="edit-description">Descripción del Puesto</label>
                  <textarea
                    id="edit-description"
                    class="form-textarea"
                    rows="4"
                    [(ngModel)]="formData.description"
                    name="description"
                    placeholder="Descripción detallada del puesto, responsabilidades, requisitos..."
                    (ngModelChange)="onFieldChange()"
                  ></textarea>
                </div>

                <!-- Location + Department Row -->
                <div class="form-row">
                  <div class="form-field" [class.field-modified]="isFieldModified('location')">
                    <label class="form-label" for="edit-location">Ubicación (Estado)</label>
                    <input
                      id="edit-location"
                      type="text"
                      class="form-input"
                      [(ngModel)]="formData.location"
                      name="location"
                      list="us-states-list"
                      placeholder="Seleccione o escriba un estado"
                      (ngModelChange)="onFieldChange()"
                    />
                    <datalist id="us-states-list">
                      @for (state of usStates; track state) {
                        <option [value]="state"></option>
                      }
                    </datalist>
                  </div>
                  <div class="form-field" [class.field-modified]="isFieldModified('department')">
                    <label class="form-label" for="edit-department">Departamento</label>
                    <mat-select
                      id="edit-department"
                      class="form-select"
                      [(ngModel)]="formData.department"
                      name="department"
                      (ngModelChange)="onFieldChange()"
                    >
                      <mat-option value="">Sin especificar</mat-option>
                      @for (dept of departmentOptions; track dept) {
                        <mat-option [value]="dept">{{ dept }}</mat-option>
                      }
                    </mat-select>
                  </div>
                </div>

                <!-- Seniority Level -->
                <div class="form-field" [class.field-modified]="isFieldModified('seniorityLevel')">
                  <label class="form-label" for="edit-seniority">Nivel de Seniority</label>
                  <mat-select
                    id="edit-seniority"
                    class="form-select"
                    [(ngModel)]="formData.seniorityLevel"
                    name="seniorityLevel"
                    (ngModelChange)="onFieldChange()"
                  >
                    <mat-option value="">Sin especificar</mat-option>
                    @for (option of seniorityOptions(); track option.value) {
                      <mat-option [value]="option.value">
                        {{ option.label }}
                      </mat-option>
                    }
                  </mat-select>
                </div>
              </div>

              <!-- Section: Tipo de Trabajo -->
              <div class="form-section">
                <h3 class="section-title">Tipo de Trabajo</h3>

                <div class="form-row">
                  <div class="form-field" [class.field-modified]="isFieldModified('workModality')">
                    <label class="form-label" for="edit-modality">Modalidad</label>
                    <mat-select
                      id="edit-modality"
                      class="form-select"
                      [(ngModel)]="formData.workModality"
                      name="workModality"
                      (ngModelChange)="onFieldChange()"
                    >
                      <mat-option value="">Sin especificar</mat-option>
                      @for (option of modalityOptions(); track option.value) {
                        <mat-option [value]="option.value">
                          {{ option.label }}
                        </mat-option>
                      }
                    </mat-select>
                  </div>
                  <div class="form-field checkbox-field" [class.field-modified]="isFieldModified('isRemoteViable')">
                    <mat-checkbox
                      [(ngModel)]="formData.isRemoteViable"
                      name="isRemoteViable"
                      (ngModelChange)="onFieldChange()"
                    >
                      Viable para trabajo remoto
                    </mat-checkbox>
                  </div>
                </div>
              </div>

              <!-- Section: Compensación -->
              <div class="form-section">
                <h3 class="section-title">Compensación</h3>

                <div class="form-row">
                  <div class="form-field" [class.field-modified]="isFieldModified('salaryMin')">
                    <label class="form-label" for="edit-salary-min">Salario Mínimo (USD)</label>
                    <input
                      id="edit-salary-min"
                      type="number"
                      class="form-input"
                      [(ngModel)]="formData.salaryMin"
                      name="salaryMin"
                      placeholder="Ej: 120000"
                      min="0"
                      (ngModelChange)="onFieldChange()"
                    />
                  </div>
                  <div class="form-field" [class.field-modified]="isFieldModified('salaryMax')">
                    <label class="form-label" for="edit-salary-max">Salario Máximo (USD)</label>
                    <input
                      id="edit-salary-max"
                      type="number"
                      class="form-input"
                      [(ngModel)]="formData.salaryMax"
                      name="salaryMax"
                      placeholder="Ej: 160000"
                      min="0"
                      (ngModelChange)="onFieldChange()"
                    />
                  </div>
                </div>
              </div>

              <!-- Section: Información de Origen -->
              <div class="form-section">
                <h3 class="section-title">Información de Origen</h3>

                <div class="form-row">
                  <div class="form-field" [class.field-modified]="isFieldModified('source')">
                    <label class="form-label" for="edit-source">Fuente</label>
                    <mat-select
                      id="edit-source"
                      class="form-select"
                      [(ngModel)]="formData.source"
                      name="source"
                      (ngModelChange)="onFieldChange()"
                    >
                      <mat-option value="">Sin especificar</mat-option>
                      @for (option of sourceOptions(); track option.value) {
                        <mat-option [value]="option.value">
                          {{ option.label }}
                        </mat-option>
                      }
                    </mat-select>
                  </div>
                  <div class="form-field" [class.field-modified]="isFieldModified('publishedDate')">
                    <label class="form-label" for="edit-published-date">Fecha de Publicación</label>
                    <input
                      id="edit-published-date"
                      type="date"
                      class="form-input"
                      [(ngModel)]="formData.publishedDate"
                      name="publishedDate"
                      (ngModelChange)="onFieldChange()"
                    />
                  </div>
                </div>

                <div class="form-field" [class.field-modified]="isFieldModified('jobUrl')">
                  <label class="form-label" for="edit-job-url">URL Original</label>
                  <input
                    id="edit-job-url"
                    type="url"
                    class="form-input"
                    [(ngModel)]="formData.jobUrl"
                    name="jobUrl"
                    placeholder="https://..."
                    (ngModelChange)="onFieldChange()"
                  />
                </div>
              </div>

              <!-- Section: Notas -->
              <div class="form-section">
                <h3 class="section-title">Notas</h3>

                <div class="form-field" [class.field-modified]="isFieldModified('notes')">
                  <label class="form-label" for="edit-notes">Notas</label>
                  <textarea
                    id="edit-notes"
                    class="form-textarea"
                    rows="3"
                    [(ngModel)]="formData.notes"
                    name="notes"
                    placeholder="Notas adicionales sobre la vacante..."
                    (ngModelChange)="onFieldChange()"
                  ></textarea>
                </div>
              </div>

              <!-- Info Note -->
              <div class="info-note">
                <mat-icon class="info-icon">info</mat-icon>
                <p>
                  <strong>Nota:</strong> El status no es editable desde aquí. Use el
                  botón "Cambiar Estado" que permite agregar una nota de seguimiento.
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
              [label]="isSaving() ? 'Guardando...' : 'Guardar Cambios'"
              variant="primary"
              [type]="'submit'"
              [disabled]="!isValid() || isSaving()"
              [loading]="isSaving()"
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

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .modified-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--mat-sys-on-tertiary-container);
      background-color: var(--mat-sys-tertiary-container);
      border-radius: 16px;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .form-section {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);

      &:last-of-type {
        border-bottom: none;
        margin-bottom: 16px;
      }
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--mat-sys-primary);
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-field {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      &.field-modified {
        position: relative;
        padding-left: 12px;
        border-left: 3px solid var(--mat-sys-tertiary);

        .form-input,
        .form-textarea,
        .form-select ::ng-deep .mat-mdc-select-trigger {
          background-color: color-mix(in srgb, var(--mat-sys-tertiary-container) 30%, var(--mat-sys-surface-container));
        }
      }
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      padding-top: 28px;

      &.field-modified {
        padding-left: 12px;
        border-left: 3px solid var(--mat-sys-tertiary);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .form-field {
        margin-bottom: 16px;
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
      transition: border-color 0.2s, background-color 0.2s;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.7;
      }

      &[type="number"] {
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }

      &[type="date"] {
        cursor: pointer;
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
          transition: background-color 0.2s;
        }
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
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
      transition: border-color 0.2s, background-color 0.2s;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.7;
      }
    }

    .info-note {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background-color: var(--mat-sys-surface-container-highest);
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 8px;

      .info-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-on-surface-variant);
        flex-shrink: 0;
        margin-top: 1px;
      }

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

    @media (max-width: 600px) {
      .modal-container {
        max-width: 95%;
        max-height: 95vh;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .checkbox-field {
        padding-top: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVacancyModalComponent {
  private readonly document = inject(DOCUMENT);

  /** Whether the modal is open */
  readonly isOpen = input<boolean>(false);

  /** Vacancy to edit */
  readonly vacancy = input<Vacancy | null>(null);

  /** Whether clicking overlay closes the modal */
  readonly closeOnOverlay = input<boolean>(true);

  /** Emits form data on submit */
  readonly submitEdit = output<EditVacancyFormData>();

  /** Emits when modal should close */
  readonly closeModal = output<void>();

  /** Internal form data */
  formData: EditVacancyFormData = this.getDefaultFormData();

  /** Original form data for tracking changes */
  private originalFormData: EditVacancyFormData = this.getDefaultFormData();

  /** Department options */
  readonly departmentOptions = DEPARTMENT_OPTIONS;

  /** US States for datalist */
  readonly usStates = US_STATES;

  /** Seniority options for select */
  readonly seniorityOptions = computed(() =>
    (Object.entries(SENIORITY_LEVEL_LABELS) as [SeniorityLevel, string][]).map(
      ([value, label]) => ({
        value,
        label,
      })
    )
  );

  /** Modality options for select */
  readonly modalityOptions = computed(() =>
    (Object.entries(WORK_MODALITY_LABELS) as [WorkModality | 'unknown', string][]).map(
      ([value, label]) => ({
        value,
        label,
      })
    )
  );

  /** Source options for select */
  readonly sourceOptions = computed(() =>
    (Object.entries(VACANCY_SOURCE_LABELS) as [VacancySource, string][]).map(
      ([value, label]) => ({
        value,
        label,
      })
    )
  );

  /** Whether form is valid */
  readonly isValid = signal(false);

  /** Whether form is being saved */
  readonly isSaving = signal(false);

  /** Number of modified fields */
  readonly modifiedFieldsCount = signal(0);

  /** Track which fields have been modified */
  private modifiedFields = new Set<keyof EditVacancyFormData>();

  constructor() {
    // Effect to populate form when modal opens
    effect(() => {
      if (this.isOpen()) {
        const vac = this.vacancy();
        if (vac) {
          this.formData = this.mapVacancyToFormData(vac);
        } else {
          this.formData = this.getDefaultFormData();
        }
        // Store original data for change tracking
        this.originalFormData = { ...this.formData };
        this.modifiedFields.clear();
        this.modifiedFieldsCount.set(0);
        this.validateForm();
      }
    });
  }

  /**
   * Maps vacancy model to form data.
   */
  private mapVacancyToFormData(vac: Vacancy): EditVacancyFormData {
    // Parse salary range to min/max if available
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;

    if (vac.salaryRange) {
      const matches = vac.salaryRange.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
      if (matches) {
        salaryMin = parseInt(matches[1].replace(/,/g, ''), 10) || null;
        salaryMax = parseInt(matches[2].replace(/,/g, ''), 10) || null;
      }
    }

    return {
      jobTitle: vac.jobTitle,
      description: vac.description ?? '',
      location: vac.location ?? '',
      department: vac.department ?? '',
      seniorityLevel: vac.seniorityLevel ?? '',
      workModality: vac.workModality ?? '',
      isRemoteViable: vac.isRemoteViable ?? false,
      salaryMin,
      salaryMax,
      source: vac.source ?? '',
      jobUrl: vac.jobUrl ?? '',
      publishedDate: vac.publishedDate ? vac.publishedDate.split('T')[0] : '',
      notes: vac.notes ?? '',
    };
  }

  /**
   * Validates the form and updates isValid signal.
   */
  validateForm(): void {
    this.isValid.set(this.formData.jobTitle.trim().length > 0);
  }

  /**
   * Handles field change - updates modified tracking.
   */
  onFieldChange(): void {
    this.validateForm();
    this.updateModifiedFields();
  }

  /**
   * Updates the set of modified fields.
   */
  private updateModifiedFields(): void {
    const fields: (keyof EditVacancyFormData)[] = [
      'jobTitle', 'description', 'location', 'department', 'seniorityLevel',
      'workModality', 'isRemoteViable', 'salaryMin', 'salaryMax', 'source',
      'jobUrl', 'publishedDate', 'notes'
    ];

    this.modifiedFields.clear();

    for (const field of fields) {
      const current = this.formData[field];
      const original = this.originalFormData[field];

      // Compare values (handle null/undefined/empty string as equivalent)
      const currentVal = current ?? '';
      const originalVal = original ?? '';

      if (currentVal !== originalVal) {
        this.modifiedFields.add(field);
      }
    }

    this.modifiedFieldsCount.set(this.modifiedFields.size);
  }

  /**
   * Checks if a specific field has been modified.
   */
  isFieldModified(field: keyof EditVacancyFormData): boolean {
    return this.modifiedFields.has(field);
  }

  /**
   * Returns whether there are unsaved changes.
   */
  hasUnsavedChanges(): boolean {
    return this.modifiedFieldsCount() > 0;
  }

  /**
   * Returns default form data.
   */
  private getDefaultFormData(): EditVacancyFormData {
    return {
      jobTitle: '',
      description: '',
      location: '',
      department: '',
      seniorityLevel: '',
      workModality: '',
      isRemoteViable: false,
      salaryMin: null,
      salaryMax: null,
      source: '',
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
      this.confirmClose();
    }
  }

  /**
   * Confirms close if there are unsaved changes.
   */
  private confirmClose(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = this.document.defaultView?.confirm(
        '¿Está seguro de que desea cerrar? Los cambios no guardados se perderán.'
      );
      if (!confirmed) return;
    }
    this.close();
  }

  /**
   * Closes the modal.
   */
  close(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = this.document.defaultView?.confirm(
        '¿Está seguro de que desea cerrar? Los cambios no guardados se perderán.'
      );
      if (!confirmed) return;
    }
    this.isSaving.set(false);
    this.closeModal.emit();
  }

  /**
   * Submits the edit form.
   */
  submit(): void {
    this.validateForm();
    if (!this.isValid() || this.isSaving()) return;

    this.isSaving.set(true);

    this.submitEdit.emit({
      ...this.formData,
      jobTitle: this.formData.jobTitle.trim(),
      description: this.formData.description.trim(),
      location: this.formData.location.trim(),
      department: this.formData.department.trim(),
      jobUrl: this.formData.jobUrl.trim(),
      notes: this.formData.notes.trim(),
    });
  }

  /**
   * Resets the saving state (call after API response).
   */
  resetSavingState(): void {
    this.isSaving.set(false);
  }
}
