import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, CustomButtonComponent],
  template: `
    @if (isOpen()) {
      <div
        class="modal-overlay"
        (click)="onOverlayClick()"
        (keydown.enter)="onOverlayClick()"
        (keydown.escape)="cancel()"
        tabindex="0"
        role="button"
      >
        <div
          class="modal-container"
          (click)="$event.stopPropagation()"
          tabindex="0"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
        >
          <div class="modal-header">
            <h2 class="modal-title" [id]="titleId">{{ title() }}</h2>
            <button mat-icon-button (click)="cancel()" aria-label="Cerrar">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-icon" aria-hidden="true">
              @if (emoji()) {
                <span class="modal-emoji">{{ emoji() }}</span>
              } @else {
                <mat-icon>{{ icon() }}</mat-icon>
              }
            </div>
            <p class="modal-message" [innerHTML]="message()"></p>
          </div>

          <div class="modal-footer">
            <app-custom-button
              [label]="cancelLabel()"
              variant="secondary"
              (buttonClick)="cancel()"
            />
            <app-custom-button
              [label]="confirmLabel()"
              [variant]="confirmVariant()"
              (buttonClick)="confirm()"
            />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background-color: var(--mat-sys-surface-container-high);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.97);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .modal-body {
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .modal-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      margin: 0 auto 8px;
      border-radius: 50%;
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .modal-emoji {
      font-size: 36px;
      line-height: 1;
    }

    .modal-message {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.78);
      margin: 0;
      line-height: 1.5;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .modal-message strong {
      color: #ffffff;
      font-weight: 700;
    }

    .modal-message :deep(.company-name) {
      color: #4da3ff;
      font-weight: 700;
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 16px 20px 20px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Confirmar');
  readonly message = input<string>('');
  readonly icon = input<string>('work');
  readonly emoji = input<string>('');
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');
  readonly confirmVariant = input<'primary' | 'warn'>('primary');

  readonly confirmAction = output<void>();
  readonly cancelAction = output<void>();

  readonly titleId = `confirmation-modal-title`;

  confirm(): void {
    this.confirmAction.emit();
  }

  cancel(): void {
    this.cancelAction.emit();
  }

  onOverlayClick(): void {
    this.cancel();
  }
}
