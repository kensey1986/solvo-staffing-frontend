import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PIPELINE_STAGE_LABELS, PipelineStage } from '@core/models/vacancy.model';

/**
 * PipelineBadgeComponent
 *
 * Displays a colored badge representing the pipeline stage.
 * Uses signals for reactive input handling.
 */
@Component({
  selector: 'app-pipeline-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="pipeline-badge"
      [class]="badgeClass()"
      [attr.aria-label]="'Pipeline stage: ' + label()"
    >
      {{ label() }}
    </span>
  `,
  styles: `
    .pipeline-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      min-width: 90px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
      cursor: default;
      transition: filter 0.15s ease;
    }

    .pipeline-badge:hover {
      filter: brightness(1.1);
    }

    .badge-detected {
      background-color: rgba(115, 115, 115, 0.2);
      color: #a3a3a3;
      border: 1px solid rgba(115, 115, 115, 0.3);
    }

    .badge-contacted {
      background-color: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .badge-proposal {
      background-color: rgba(234, 179, 8, 0.15);
      color: #facc15;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }

    .badge-won {
      background-color: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .badge-lost {
      background-color: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineBadgeComponent {
  /** Pipeline stage to display */
  readonly stage = input.required<PipelineStage>();

  /** Whether the badge is clickable */
  readonly clickable = input<boolean>(false);

  /** Computed CSS class based on stage */
  protected readonly badgeClass = computed(() => {
    const classes = ['pipeline-badge', `badge-${this.stage()}`];
    if (this.clickable()) {
      classes.push('clickable');
    }
    return classes.join(' ');
  });

  /** Computed label for the stage */
  protected readonly label = computed(() => PIPELINE_STAGE_LABELS[this.stage()]);
}
