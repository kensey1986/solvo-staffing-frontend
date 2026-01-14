import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VACANCY_STATUS_LABELS, VacancyStatus } from '@core/models/vacancy.model';

/**
 * StatusBadgeComponent
 *
 * Displays a badge representing the vacancy status.
 * Uses signals for reactive input handling.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="badgeClass()" [attr.aria-label]="'Status: ' + label()">
      {{ label() }}
    </span>
  `,
  styles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
    }

    .badge-active {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--mat-sys-on-surface, #fafafa);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .badge-filled {
      background-color: transparent;
      color: var(--mat-sys-on-surface-variant, #a3a3a3);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .badge-expired {
      background-color: transparent;
      color: var(--mat-sys-outline, #737373);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  /** Vacancy status to display */
  readonly status = input.required<VacancyStatus>();

  /** Computed CSS class based on status */
  protected readonly badgeClass = computed(() => `status-badge badge-${this.status()}`);

  /** Computed label for the status */
  protected readonly label = computed(() => VACANCY_STATUS_LABELS[this.status()]);
}
