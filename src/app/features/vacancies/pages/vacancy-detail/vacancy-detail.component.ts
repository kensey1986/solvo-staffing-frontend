import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  VACANCY_SERVICE,
  VACANCY_SERVICE_PROVIDER,
  Vacancy,
  VacancyStateChange,
  VACANCY_SOURCE_LABELS,
  PIPELINE_STAGE_LABELS,
  PipelineStage,
} from '@core';
import {
  PipelineBadgeComponent,
  StatusBadgeComponent,
  StateChangeModalComponent,
  EditVacancyModalComponent,
  EditVacancyFormData,
  StateOption,
  StateChangeResult,
} from '@shared';
import { UpdateVacancyDto } from '@core';

/** Pipeline stage options for state change */
const PIPELINE_STAGES: PipelineStage[] = ['detected', 'contacted', 'proposal', 'won', 'lost'];

/**
 * VacancyDetailComponent
 *
 * Detail page for viewing and managing a single vacancy.
 * Features tabs for General info and State History (CRM tracking).
 */
@Component({
  selector: 'app-vacancy-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PipelineBadgeComponent,
    StatusBadgeComponent,
    StateChangeModalComponent,
    EditVacancyModalComponent,
  ],
  providers: [VACANCY_SERVICE_PROVIDER],
  templateUrl: './vacancy-detail.component.html',
  styleUrl: './vacancy-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyDetailComponent implements OnInit {
  private readonly vacancyService = inject(VACANCY_SERVICE);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // State
  readonly isLoading = signal(true);
  readonly vacancy = signal<Vacancy | null>(null);
  readonly stateHistory = signal<VacancyStateChange[]>([]);
  readonly selectedTabIndex = signal(0);
  readonly showStateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly isNotesExpanded = signal(false);

  // History table columns
  readonly historyColumns = ['date', 'user', 'change', 'note', 'tags'];

  // State options for state change modal
  readonly stateOptions = computed<StateOption<PipelineStage>[]>(() =>
    PIPELINE_STAGES.map(stage => ({
      value: stage,
      label: PIPELINE_STAGE_LABELS[stage],
    }))
  );

  // Computed values
  readonly vacancyId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  readonly pageTitle = computed(() => this.vacancy()?.jobTitle || 'Vacancy Detail');

  readonly sourceLabel = computed(() => {
    const source = this.vacancy()?.source;
    return source ? VACANCY_SOURCE_LABELS[source] : '';
  });

  ngOnInit(): void {
    const id = this.vacancyId();
    if (id) {
      this.loadVacancy(id);
      this.loadStateHistory(id);
    }
  }

  /**
   * Loads the vacancy details.
   */
  loadVacancy(id: number): void {
    this.isLoading.set(true);
    this.vacancyService.getById(id).subscribe({
      next: vacancy => {
        this.vacancy.set(vacancy);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Error loading vacancy:', err);
        this.snackBar.open('Error loading vacancy', 'Close', { duration: 3000 });
        this.isLoading.set(false);
        this.router.navigate(['/vacancies']);
      },
    });
  }

  /**
   * Loads the state change history.
   */
  loadStateHistory(id: number): void {
    this.vacancyService.getStateHistory(id).subscribe({
      next: history => {
        this.stateHistory.set(history);
      },
      error: err => {
        console.error('Error loading state history:', err);
      },
    });
  }

  /**
   * Opens the edit vacancy dialog.
   */
  openEditDialog(): void {
    if (this.vacancy()) {
      this.showEditModal.set(true);
    }
  }

  /**
   * Closes the edit vacancy dialog.
   */
  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  /**
   * Handles edit form submission.
   */
  onEditSubmit(formData: EditVacancyFormData): void {
    const id = this.vacancyId();
    if (!id) return;

    const updateDto: UpdateVacancyDto = {
      jobTitle: formData.jobTitle,
      status: formData.status,
      department: formData.department || undefined,
      seniorityLevel: formData.seniorityLevel || undefined,
      salaryRange: formData.salaryRange || undefined,
      notes: formData.notes || undefined,
    };

    this.vacancyService.update(id, updateDto).subscribe({
      next: updated => {
        this.vacancy.set(updated);
        this.closeEditModal();
        this.snackBar.open('Vacancy updated successfully', 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error updating vacancy:', err);
        this.snackBar.open('Error updating vacancy', 'Close', { duration: 3000 });
      },
    });
  }

  /**
   * Opens the state change dialog.
   */
  openStateChangeDialog(): void {
    if (this.vacancy()) {
      this.showStateModal.set(true);
    }
  }

  /**
   * Closes the state change dialog.
   */
  closeStateModal(): void {
    this.showStateModal.set(false);
  }

  /**
   * Handles state change from modal.
   */
  onStateChange(result: StateChangeResult<PipelineStage | undefined>): void {
    const id = this.vacancyId();
    if (!id || !result.newState) return;

    const changeDto = {
      newState: result.newState,
      note: result.note,
      tags: result.tags,
    };

    this.vacancyService.changeState(id, changeDto).subscribe({
      next: updated => {
        this.vacancy.set(updated);
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

  /**
   * Formats date for display.
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Formats datetime for display.
   */
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Gets pipeline stage label.
   */
  getPipelineLabel(stage: string): string {
    return PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] || stage;
  }

  /**
   * Assigns the current vacancy to the logged-in user.
   */
  assignMe(): void {
    const id = this.vacancyId();
    if (!id) return;

    if (confirm('¿Deseas asignarte esta vacante?')) {
      const updateDto: UpdateVacancyDto = {
        assignedTo: 'Carlos M.', // Mock current user
      };

      this.vacancyService.update(id, updateDto).subscribe({
        next: updated => {
          this.vacancy.set(updated);
          this.snackBar.open('Vacante asignada exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: err => {
          console.error('Error assigning vacancy:', err);
          this.snackBar.open('Error al asignar la vacante', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  /**
   * Gets remote viable display text.
   */
  getRemoteViableText(value?: boolean): string {
    if (value === undefined) return 'N/A';
    return value ? 'Yes' : 'No';
  }
}
