import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  Vacancy,
  VacancyStatus,
  SeniorityLevel,
  VACANCY_STATUS_LABELS,
  SENIORITY_LEVEL_LABELS,
} from '@core';

/**
 * Form data for editing a vacancy.
 */
export interface EditVacancyFormData {
  jobTitle: string;
  status: VacancyStatus;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  salaryRange: string;
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
            <h2 id="edit-vacancy-title" class="modal-title">Editar Vacante</h2>
            <button mat-icon-button (click)="close()" aria-label="Cerrar modal">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form (ngSubmit)="submit()">
              <!-- Job Title -->
              <div class="form-field">
                <label class="form-label" for="edit-title">Título del Puesto *</label>
                <input
                  id="edit-title"
                  type="text"
                  class="form-input"
                  [(ngModel)]="formData.jobTitle"
                  name="jobTitle"
                  required
                  placeholder="Ej: Senior Software Engineer"
                />
              </div>

              <!-- Status + Department Row -->
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label" for="edit-status">Status</label>
                  <mat-select
                    id="edit-status"
                    class="form-select"
                    [(ngModel)]="formData.status"
                    name="status"
                  >
                    @for (option of statusOptions(); track option.value) {
                      <mat-option [value]="option.value">
                        {{ option.label }}
                      </mat-option>
                    }
                  </mat-select>
                </div>
                <div class="form-field">
                  <label class="form-label" for="edit-department">Departamento</label>
                  <input
                    id="edit-department"
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
                  <label class="form-label" for="edit-seniority">Nivel de Seniority</label>
                  <mat-select
                    id="edit-seniority"
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
                  <label class="form-label" for="edit-salary">Rango Salarial</label>
                  <input
                    id="edit-salary"
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.salaryRange"
                    name="salaryRange"
                    placeholder="Ej: $120,000 - $160,000"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div class="form-field">
                <label class="form-label" for="edit-notes">Notas</label>
                <textarea
                  id="edit-notes"
                  class="form-textarea"
                  rows="3"
                  [(ngModel)]="formData.notes"
                  name="notes"
                  placeholder="Notas adicionales sobre la vacante..."
                ></textarea>
              </div>

              <!-- Info Note -->
              <div class="info-note">
                <p>
                  <strong>Nota:</strong> El estado del pipeline no es editable desde aquí. Use el
                  botón "Cambiar Estado" para modificarlo con una nota de seguimiento.
                </p>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button mat-stroked-button type="button" (click)="close()">Cancelar</button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              (click)="submit()"
              [disabled]="!isValid()"
            >
              Guardar Cambios
            </button>
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
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.7;
      }
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVacancyModalComponent {
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

  /** Status options for select */
  readonly statusOptions = computed(() =>
    (Object.entries(VACANCY_STATUS_LABELS) as [VacancyStatus, string][]).map(([value, label]) => ({
      value,
      label,
    }))
  );

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

  constructor() {
    // Effect to populate form when modal opens
    effect(() => {
      if (this.isOpen()) {
        const vac = this.vacancy();
        if (vac) {
          this.formData = {
            jobTitle: vac.jobTitle,
            status: vac.status,
            department: vac.department ?? '',
            seniorityLevel: vac.seniorityLevel ?? '',
            salaryRange: vac.salaryRange ?? '',
            notes: vac.notes ?? '',
          };
        } else {
          this.formData = this.getDefaultFormData();
        }
        this.validateForm();
      }
    });
  }

  /**
   * Validates the form and updates isValid signal.
   */
  validateForm(): void {
    this.isValid.set(this.formData.jobTitle.trim().length > 0);
  }

  /**
   * Returns default form data.
   */
  private getDefaultFormData(): EditVacancyFormData {
    return {
      jobTitle: '',
      status: 'active',
      department: '',
      seniorityLevel: '',
      salaryRange: '',
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
   * Closes the modal.
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Submits the edit form.
   */
  submit(): void {
    this.validateForm();
    if (!this.isValid()) return;

    this.submitEdit.emit({
      ...this.formData,
      jobTitle: this.formData.jobTitle.trim(),
      department: this.formData.department.trim(),
      salaryRange: this.formData.salaryRange.trim(),
      notes: this.formData.notes.trim(),
    });
  }
}
