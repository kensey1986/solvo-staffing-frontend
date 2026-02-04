import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyPipelineStage, COMPANY_PIPELINE_LABELS } from '@core/models/company.model';

/**
 * CompanyPipelineBadgeComponent
 *
 * Displays a colored badge representing the company pipeline stage.
 * Uses signals for reactive input handling.
 */
@Component({
  selector: 'app-company-pipeline-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="pipeline-badge"
      [class]="badgeClass()"
      [attr.aria-label]="'Etapa del pipeline: ' + label()"
    >
      {{ label() }}
    </span>
  `,
  styles: `
    .pipeline-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
      cursor: default;
      transition: filter 0.15s ease;
    }

    .pipeline-badge:hover {
      filter: brightness(1.1);
    }

    .badge-lead {
      background-color: #e0e0e0;
      color: #424242;
    }

    .badge-prospecting {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .badge-engaged {
      background-color: #fff3e0;
      color: #e65100;
    }

    .badge-proposal {
      background-color: #fff8e1;
      color: #f57f17;
    }

    .badge-client {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .badge-lost {
      background-color: #ffebee;
      color: #c62828;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyPipelineBadgeComponent {
  /** The pipeline stage to display */
  readonly stage = input.required<CompanyPipelineStage>();

  /** Computed label text */
  protected readonly label = computed(() => COMPANY_PIPELINE_LABELS[this.stage()]);

  /** Computed CSS class */
  protected readonly badgeClass = computed(() => `pipeline-badge badge-${this.stage()}`);
}
