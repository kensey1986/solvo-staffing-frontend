import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * KpiCardComponent
 *
 * Reusable KPI card for dashboard metrics.
 * Follows the visual style of the prototype.
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  /**
   * Title/Label of the KPI.
   */
  public readonly label = input.required<string>();

  /**
   * Numeric or text value of the KPI.
   */
  public readonly value = input.required<string | number>();

  /**
   * Material icon name.
   */
  public readonly icon = input.required<string>();

  /**
   * Color variant for the icon background.
   */
  public readonly iconColor = input<'purple' | 'blue' | 'green' | 'orange'>('purple');
}
