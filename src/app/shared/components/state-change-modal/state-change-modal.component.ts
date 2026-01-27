import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnChanges,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TagsInputComponent } from '../tags-input/tags-input.component';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

/**
 * State option for the dropdown.
 */
export interface StateOption<T = string> {
  value: T;
  label: string;
}

/**
 * State change result emitted on submit.
 */
export interface StateChangeResult<T = string> {
  newState: T;
  note: string;
  tags: string[];
}

/**
 * StateChangeModalComponent
 *
 * Reusable modal for changing pipeline/workflow states.
 * Includes state selection, note input with validation, and optional tags.
 *
 * @example
 * ```html
 * <app-state-change-modal
 *   [isOpen]="showModal()"
 *   [title]="'Change Pipeline State'"
 *   [currentState]="currentPipelineStage"
 *   [states]="pipelineOptions"
 *   [minNoteLength]="10"
 *   (submitChange)="onStateChange($event)"
 *   (closeModal)="closeModal()"
 * />
 * ```
 */
@Component({
  selector: 'app-state-change-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TagsInputComponent,
    CustomButtonComponent,
  ],
  template: `
    @if (isOpen()) {
      <div
        class="modal-overlay"
        (click)="onOverlayClick()"
        (keydown.enter)="onOverlayClick()"
        (keydown.space)="onOverlayClick()"
        tabindex="0"
        role="button"
      >
        <div
          class="modal-container"
          (click)="$event.stopPropagation()"
          (keydown.enter)="$event.stopPropagation()"
          (keydown.space)="$event.stopPropagation()"
          tabindex="0"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-header">
            <h2 class="modal-title">{{ title() }}</h2>
            <button mat-icon-button (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="modal-body">
            <!-- State Selection -->
            <div class="form-field">
              <label class="form-label" [for]="stateSelectId">{{ stateLabel() }} *</label>
              <mat-select
                [id]="stateSelectId"
                class="form-select"
                [(ngModel)]="selectedState"
                [attr.aria-label]="stateLabel()"
              >
                @for (state of states(); track state.value) {
                  <mat-option [value]="state.value">
                    {{ state.label }}
                  </mat-option>
                }
              </mat-select>
            </div>

            <!-- Note Input -->
            <div class="form-field">
              <label class="form-label" [for]="noteTextareaId">
                {{ noteLabel() }} *
                @if (minNoteLength() > 0) {
                  <span class="note-hint">(min {{ minNoteLength() }} characters)</span>
                }
              </label>
              <textarea
                [id]="noteTextareaId"
                class="form-textarea"
                rows="3"
                [(ngModel)]="noteText"
                [placeholder]="notePlaceholder()"
                [attr.aria-label]="noteLabel()"
              ></textarea>
              @if (minNoteLength() > 0) {
                <span
                  class="char-count"
                  [class.error]="noteText.length > 0 && noteText.length < minNoteLength()"
                >
                  {{ noteText.length }}/{{ minNoteLength() }} min characters
                </span>
              }
            </div>

            <!-- Tags Input -->
            @if (showTags()) {
              <div class="form-field">
                <span class="form-label" [id]="tagsLabelId">{{ tagsLabel() }}</span>
                <app-tags-input
                  [attr.aria-labelledby]="tagsLabelId"
                  [tags]="tags()"
                  [placeholder]="tagsPlaceholder()"
                  [maxTags]="maxTags()"
                  [showCounter]="false"
                  (tagsChange)="tags.set($event)"
                />
              </div>
            }
          </div>

          <div class="modal-footer">
            <app-custom-button
              [label]="cancelLabel()"
              variant="secondary"
              [type]="'button'"
              (buttonClick)="close()"
            />
            <app-custom-button
              [label]="submitLabel()"
              variant="primary"
              [type]="'button'"
              [disabled]="!isValid()"
              (buttonClick)="submit()"
            />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .modal-container {
      background-color: var(--mat-sys-surface-container-high);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .form-field {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 8px;
    }

    .note-hint {
      font-weight: 400;
      opacity: 0.8;
    }

    .form-select {
      width: 100%;

      ::ng-deep {
        .mat-mdc-select-trigger {
          padding: 12px;
          background-color: var(--mat-sys-surface-container);
          border: 1px solid var(--mat-sys-outline-variant);
          border-radius: 6px;
        }
      }
    }

    .form-textarea {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--mat-sys-on-surface);
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 6px;
      outline: none;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;

      &:focus {
        border-color: var(--mat-sys-primary);
      }

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .char-count {
      display: block;
      font-size: 11px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
      text-align: right;

      &.error {
        color: var(--mat-sys-error);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateChangeModalComponent<T = string> implements OnChanges {
  /** Whether the modal is open */
  readonly isOpen = input<boolean>(false);

  /** Modal title */
  readonly title = input<string>('Change State');

  /** Current state value (for pre-selection) */
  readonly currentState = input<T | null>(null);

  /** Available state options */
  readonly states = input<StateOption<T>[]>([]);

  /** Label for state dropdown */
  readonly stateLabel = input<string>('New State');

  /** Label for note field */
  readonly noteLabel = input<string>('Note');

  /** Placeholder for note textarea */
  readonly notePlaceholder = input<string>('Describe the reason for the change...');

  /** Minimum note length required */
  readonly minNoteLength = input<number>(10);

  /** Whether to show tags input */
  readonly showTags = input<boolean>(true);

  /** Label for tags field */
  readonly tagsLabel = input<string>('Tags');

  /** Placeholder for tags input */
  readonly tagsPlaceholder = input<string>('Add tag...');

  /** Maximum tags allowed */
  readonly maxTags = input<number>(5);

  /** Submit button label */
  readonly submitLabel = input<string>('Save');

  /** Cancel button label */
  readonly cancelLabel = input<string>('Cancel');

  /** Whether clicking overlay closes the modal */
  readonly closeOnOverlay = input<boolean>(true);

  /** Emits state change result on submit */
  readonly submitChange = output<StateChangeResult<T>>();

  /** Emits when modal should close */
  readonly closeModal = output<void>();

  /** Internal state for selected value */
  protected selectedState: T | null = null;

  /** Internal state for note text */
  protected noteText = '';

  /** Internal state for tags */
  readonly tags = signal<string[]>([]);

  /** Whether form is valid for submission */
  readonly isValid = computed(() => {
    const minLen = this.minNoteLength();
    return this.selectedState !== null && (minLen === 0 || this.noteText.length >= minLen);
  });

  readonly stateSelectId = `state-select-${Math.random().toString(36).slice(2)}`;
  readonly noteTextareaId = `state-note-${Math.random().toString(36).slice(2)}`;
  readonly tagsLabelId = `state-tags-${Math.random().toString(36).slice(2)}`;

  /**
   * Initializes form when modal opens.
   */
  ngOnChanges(): void {
    if (this.isOpen()) {
      this.selectedState = this.currentState() ?? null;
      this.noteText = '';
      this.tags.set([]);
    }
  }

  /**
   * Handles overlay click.
   */
  onOverlayClick(): void {
    if (this.closeOnOverlay()) {
      this.close();
    }
  }

  /**
   * Closes the modal.
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Submits the state change.
   */
  submit(): void {
    if (!this.isValid() || this.selectedState === null) return;

    this.submitChange.emit({
      newState: this.selectedState,
      note: this.noteText.trim(),
      tags: this.tags(),
    });
  }
}
