import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { CustomCardComponent } from '@shared/components/custom-card/custom-card.component';

/**
 * DashboardPageComponent
 *
 * Main dashboard page demonstrating the use of shared components.
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CustomButtonComponent, CustomCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  /**
   * Handle primary button click.
   */
  public onPrimaryClick(): void {
    console.warn('Primary button clicked!');
  }

  /**
   * Handle secondary button click.
   */
  public onSecondaryClick(): void {
    console.warn('Secondary button clicked!');
  }

  /**
   * Handle card click.
   */
  public onCardClick(): void {
    console.warn('Card clicked!');
  }
}
