import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Card elevation levels for CustomCardComponent.
 */
export type CardElevation = 'flat' | 'raised' | 'elevated';

/**
 * CustomCardComponent
 *
 * A reusable card component that integrates with the Solvo design system.
 * Uses Signal-based inputs for optimal performance with OnPush change detection.
 *
 * @example
 * ```html
 * <app-custom-card
 *   title="Dashboard"
 *   subtitle="Overview of your activities"
 *   elevation="raised"
 * >
 *   <p>Card content goes here...</p>
 * </app-custom-card>
 * ```
 *
 * @example
 * ```html
 * <app-custom-card
 *   [clickable]="true"
 *   (cardClick)="onCardClick()"
 * >
 *   <ng-container card-header>
 *     <h3>Custom Header</h3>
 *   </ng-container>
 *   <p>Clickable card content</p>
 * </app-custom-card>
 * ```
 */
@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './custom-card.component.html',
  styleUrl: './custom-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCardComponent {
  /**
   * Optional card title.
   */
  public readonly title = input<string | undefined>(undefined);

  /**
   * Optional card subtitle.
   */
  public readonly subtitle = input<string | undefined>(undefined);

  /**
   * Optional icon to display in the header.
   */
  public readonly icon = input<string | undefined>(undefined);

  /**
   * Card elevation level.
   * @default 'raised'
   */
  public readonly elevation = input<CardElevation>('raised');

  /**
   * Whether the card is clickable.
   * @default false
   */
  public readonly clickable = input<boolean>(false);

  /**
   * Whether the card is in a selected state.
   * @default false
   */
  public readonly selected = input<boolean>(false);

  /**
   * Whether to show card padding.
   * @default true
   */
  public readonly padded = input<boolean>(true);

  /**
   * Emitted when the card is clicked (only if clickable is true).
   */
  public readonly cardClick = output<MouseEvent>();

  /**
   * Handles card click events.
   * Only emits when the card is clickable.
   */
  public onClick(event: MouseEvent): void {
    if (this.clickable()) {
      this.cardClick.emit(event);
    }
  }

  /**
   * Handles keyboard events for accessibility.
   * Allows card activation via Enter or Space keys.
   */
  public onKeydown(event: KeyboardEvent): void {
    if (this.clickable() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.cardClick.emit(new MouseEvent('click'));
    }
  }
}
