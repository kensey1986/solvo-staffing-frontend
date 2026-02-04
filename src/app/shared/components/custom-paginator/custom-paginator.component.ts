import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

/**
 * Page change event interface
 */
export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

/**
 * CustomPaginatorComponent
 *
 * A reusable paginator component with a custom design.
 * Shows page numbers with ellipsis for large datasets.
 */
@Component({
  selector: 'app-custom-paginator',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './custom-paginator.component.html',
  styleUrl: './custom-paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPaginatorComponent {
  /** Current active page (1-based) */
  readonly currentPage = input.required<number>();

  /** Number of items per page */
  readonly pageSize = input.required<number>();

  /** Page size options */
  readonly pageSizeOptions = input<number[]>([25, 50, 100]);

  /** Total number of items */
  readonly totalItems = input.required<number>();

  /** Emits when page changes */
  readonly pageChange = output<PageChangeEvent>();

  /** Total number of pages */
  readonly totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return Math.ceil(total / size) || 1;
  });

  /** Range text showing current items */
  readonly rangeText = computed(() => {
    const current = this.currentPage();
    const size = this.pageSize();
    const total = this.totalItems();

    if (total === 0) return 'Mostrando 0 de 0';

    const start = (current - 1) * size + 1;
    const end = Math.min(current * size, total);
    return `Mostrando ${start.toLocaleString()}-${end.toLocaleString()} de ${total.toLocaleString()}`;
  });

  /** Whether previous button should be disabled */
  readonly isPrevDisabled = computed(() => this.currentPage() <= 1);

  /** Whether next button should be disabled */
  readonly isNextDisabled = computed(() => this.currentPage() >= this.totalPages());

  /** Array of page numbers/ellipsis to display */
  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 3) {
        // Near the start: 1, 2, 3, 4, ..., last
        pages.push(2, 3, 4, 'ellipsis', total);
      } else if (current >= total - 2) {
        // Near the end: 1, ..., last-3, last-2, last-1, last
        pages.push('ellipsis', total - 3, total - 2, total - 1, total);
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', total);
      }
    }

    return pages;
  });

  /**
   * Navigate to previous page
   */
  goToPrevious(): void {
    if (!this.isPrevDisabled()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /**
   * Navigate to next page
   */
  goToNext(): void {
    if (!this.isNextDisabled()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit({
        page,
        pageSize: this.pageSize(),
      });
    }
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(pageSize: number): void {
    if (pageSize && pageSize !== this.pageSize()) {
      this.pageChange.emit({
        page: 1,
        pageSize,
      });
    }
  }

  /**
   * Check if item is ellipsis
   */
  isEllipsis(item: number | 'ellipsis'): item is 'ellipsis' {
    return item === 'ellipsis';
  }
}
