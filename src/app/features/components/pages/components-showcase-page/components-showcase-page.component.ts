import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent, CustomCardComponent } from '@shared';

/**
 * ComponentsShowcasePageComponent
 *
 * Page demonstrating the use of shared components.
 * Moved from dashboard page.
 */
@Component({
  selector: 'app-components-showcase-page',
  standalone: true,
  imports: [CommonModule, CustomButtonComponent, CustomCardComponent],
  templateUrl: './components-showcase-page.component.html',
  styleUrl: './components-showcase-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsShowcasePageComponent {
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
