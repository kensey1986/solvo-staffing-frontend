import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Button variant types for CustomButtonComponent.
 * - primary: Main action button (Sandy Orange)
 * - secondary: Secondary action button (Malibu Blue)
 * - warn: Destructive action button
 * - text: Text-only button
 */
export type ButtonVariant = 'primary' | 'secondary' | 'warn' | 'text';

/**
 * Button size types for CustomButtonComponent.
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * CustomButtonComponent
 *
 * A reusable button component that integrates with the Solvo design system.
 * Uses Signal-based inputs and outputs for optimal performance.
 *
 * @example
 * ```html
 * <app-custom-button
 *   label="Submit"
 *   variant="primary"
 *   size="medium"
 *   (buttonClick)="onSubmit()"
 * />
 * ```
 *
 * @example
 * ```html
 * <app-custom-button
 *   label="Loading..."
 *   [loading]="true"
 *   [disabled]="true"
 * />
 * ```
 */
@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomButtonComponent {
  /**
   * Button label text.
   */
  public readonly label = input.required<string>();

  /**
   * Button visual variant.
   * @default 'primary'
   */
  public readonly variant = input<ButtonVariant>('primary');

  /**
   * Button size.
   * @default 'medium'
   */
  public readonly size = input<ButtonSize>('medium');

  /**
   * Whether the button is disabled.
   * @default false
   */
  public readonly disabled = input<boolean>(false);

  /**
   * Whether to show a loading spinner.
   * @default false
   */
  public readonly loading = input<boolean>(false);

  /**
   * Optional icon name (Material Icons).
   */
  public readonly icon = input<string | undefined>(undefined);

  /**
   * Icon position relative to label.
   * @default 'start'
   */
  public readonly iconPosition = input<'start' | 'end'>('start');

  /**
   * Button type attribute.
   * @default 'button'
   */
  public readonly type = input<'button' | 'submit' | 'reset'>('button');

  /**
   * Whether to render as full-width button.
   * @default false
   */
  public readonly fullWidth = input<boolean>(false);

  /**
   * Emitted when the button is clicked (and not disabled/loading).
   */
  public readonly buttonClick = output<MouseEvent>();

  /**
   * Handles button click events.
   * Prevents emission when disabled or loading.
   */
  public onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.buttonClick.emit(event);
    }
  }
}
