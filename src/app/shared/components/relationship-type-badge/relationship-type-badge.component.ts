import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyRelationshipType, COMPANY_RELATIONSHIP_LABELS } from '@core/models/company.model';

/**
 * RelationshipTypeBadgeComponent
 *
 * Displays a colored badge representing the company relationship type.
 * Uses signals for reactive input handling.
 */
@Component({
  selector: 'app-relationship-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="relationship-badge"
      [class]="badgeClass()"
      [attr.aria-label]="'Tipo de relación: ' + label()"
    >
      {{ label() }}
    </span>
  `,
  styles: `
    .relationship-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 4px;
      cursor: default;
      transition: filter 0.15s ease;
    }

    .relationship-badge:hover {
      filter: brightness(1.1);
    }

    .badge-client {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .badge-prospect {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .badge-lead {
      background-color: #fff3e0;
      color: #e65100;
    }

    .badge-inactive {
      background-color: #f5f5f5;
      color: #757575;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationshipTypeBadgeComponent {
  /** The relationship type to display */
  readonly type = input.required<CompanyRelationshipType>();

  /** Computed label text */
  protected readonly label = computed(() => COMPANY_RELATIONSHIP_LABELS[this.type()]);

  /** Computed CSS class */
  protected readonly badgeClass = computed(() => `relationship-badge badge-${this.type()}`);
}
