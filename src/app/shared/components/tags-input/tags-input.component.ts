import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * TagsInputComponent
 *
 * Reusable component for entering and displaying tags.
 * Supports add/remove operations, max tags limit, and readonly mode.
 *
 * @example
 * ```html
 * <app-tags-input
 *   [tags]="['urgent', 'follow-up']"
 *   [placeholder]="'Add tag...'"
 *   [maxTags]="5"
 *   (tagsChange)="onTagsChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-tags-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="tags-input-container" [class.readonly]="readonly()">
      <div class="tags-list">
        @for (tag of tags(); track tag) {
          <span class="tag-chip">
            {{ tag }}
            @if (!readonly()) {
              <button
                type="button"
                class="tag-remove"
                (click)="removeTag(tag)"
                [attr.aria-label]="'Remove tag ' + tag"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </span>
        }
      </div>

      @if (!readonly() && canAddMore()) {
        <div class="tag-input-wrapper">
          <input
            type="text"
            class="tag-input"
            [placeholder]="placeholder()"
            [(ngModel)]="newTagValue"
            (keydown.enter)="addTag($event)"
            (keydown.comma)="addTag($event)"
            [attr.aria-label]="placeholder()"
          />
        </div>
      }

      @if (showCounter() && maxTags() > 0) {
        <span class="tags-counter"> {{ tags().length }}/{{ maxTags() }} </span>
      }
    </div>
  `,
  styles: `
    .tags-input-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding: 8px;
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 6px;
      min-height: 40px;

      &:focus-within {
        border-color: var(--mat-sys-primary);
      }

      &.readonly {
        background-color: transparent;
        border: none;
        padding: 0;
      }
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-radius: 4px;
    }

    .tag-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 1;
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .tag-input-wrapper {
      flex: 1;
      min-width: 100px;
    }

    .tag-input {
      width: 100%;
      padding: 4px;
      font-size: 13px;
      font-family: inherit;
      color: var(--mat-sys-on-surface);
      background: transparent;
      border: none;
      outline: none;

      &::placeholder {
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .tags-counter {
      font-size: 11px;
      color: var(--mat-sys-on-surface-variant);
      margin-left: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputComponent {
  /** Current tags array */
  readonly tags = input<string[]>([]);

  /** Input placeholder text */
  readonly placeholder = input<string>('Add tag...');

  /** Maximum number of tags allowed (0 = unlimited) */
  readonly maxTags = input<number>(0);

  /** Whether the input is readonly (display only) */
  readonly readonly = input<boolean>(false);

  /** Whether to show the counter */
  readonly showCounter = input<boolean>(true);

  /** Emits when tags array changes */
  readonly tagsChange = output<string[]>();

  /** Internal state for new tag input */
  protected newTagValue = '';

  /** Whether more tags can be added */
  readonly canAddMore = computed(() => {
    const max = this.maxTags();
    return max === 0 || this.tags().length < max;
  });

  /**
   * Adds a new tag from the input.
   */
  addTag(event: Event): void {
    event.preventDefault();
    const value = this.newTagValue.trim().replace(/,/g, '');

    if (value && !this.tags().includes(value) && this.canAddMore()) {
      const newTags = [...this.tags(), value];
      this.tagsChange.emit(newTags);
      this.newTagValue = '';
    }
  }

  /**
   * Removes a tag from the list.
   */
  removeTag(tag: string): void {
    const newTags = this.tags().filter(t => t !== tag);
    this.tagsChange.emit(newTags);
  }
}
