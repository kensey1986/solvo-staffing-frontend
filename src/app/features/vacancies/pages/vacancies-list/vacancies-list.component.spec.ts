/**
 * Vacancies List Component Tests
 *
 * Unit tests for VacanciesListComponent covering rendering,
 * filtering, pagination, and navigation.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, delay } from 'rxjs';

import { VacanciesListComponent } from './vacancies-list.component';
import { VACANCY_SERVICE, Vacancy, PaginatedResponse } from '@core';

const mockVacancies: Vacancy[] = [
  {
    id: 1,
    jobTitle: 'Software Engineer',
    companyId: 10,
    companyName: 'Acme',
    location: 'Remote',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-01-01',
  },
  {
    id: 2,
    jobTitle: 'Product Manager',
    companyId: 11,
    companyName: 'Globex',
    location: 'Miami, FL',
    status: 'filled',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-01-02',
  },
];

const mockPaginatedResponse: PaginatedResponse<Vacancy> = {
  data: mockVacancies,
  total: 200,
  page: 1,
  pageSize: 50,
  totalPages: 4,
};

const createMockVacancyService = () => ({
  getAll: jest.fn().mockReturnValue(of(mockPaginatedResponse)),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  changeState: jest.fn(),
  getStateHistory: jest.fn(),
});

let mockVacancyService: ReturnType<typeof createMockVacancyService>;

describe('VacanciesListComponent', () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;
  let router: Router;

  beforeEach(async () => {
    mockVacancyService = createMockVacancyService();

    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    })
      .overrideComponent(VacanciesListComponent, {
        set: {
          providers: [{ provide: VACANCY_SERVICE, useValue: mockVacancyService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VacanciesListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load vacancies on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockVacancyService.getAll).toHaveBeenCalled();
      expect(component.vacancies().length).toBe(2);
      expect(component.totalItems()).toBe(200);
    }));

    it('should set loading state while fetching', fakeAsync(() => {
      mockVacancyService.getAll.mockReturnValue(of(mockPaginatedResponse).pipe(delay(100)));

      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      tick(100);
      expect(component.isLoading()).toBe(false);
    }));
  });

  describe('Filtering', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
      mockVacancyService.getAll.mockClear();
    }));

    it('should apply search filter', fakeAsync(() => {
      component.searchFilter.set('Engineer');
      component.applyFilters();
      tick();

      expect(mockVacancyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Engineer' })
      );
    }));

    it('should apply status filter', fakeAsync(() => {
      component.statusFilter.set('active');
      component.applyFilters();
      tick();

      expect(mockVacancyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    }));

    it('should apply pipeline filter', fakeAsync(() => {
      component.pipelineFilter.set('proposal');
      component.applyFilters();
      tick();

      expect(mockVacancyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ pipelineStage: 'proposal' })
      );
    }));

    it('should clear all filters', fakeAsync(() => {
      component.searchFilter.set('test');
      component.statusFilter.set('active');
      component.pipelineFilter.set('won');
      component.sourceFilter.set('linkedin');
      component.stateFilter.set('CA');
      component.companyFilter.set('Acme');
      component.dateFrom.set('2025-01-01');
      component.dateTo.set('2025-01-31');

      component.clearFilters();
      tick();

      expect(component.searchFilter()).toBe('');
      expect(component.statusFilter()).toBe('');
      expect(component.pipelineFilter()).toBe('');
      expect(component.sourceFilter()).toBe('');
      expect(component.stateFilter()).toBe('');
      expect(component.companyFilter()).toBe('');
      expect(component.dateFrom()).toBe('');
      expect(component.dateTo()).toBe('');
    }));
  });

  describe('Pagination', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
      mockVacancyService.getAll.mockClear();
    }));

    it('should handle page change', fakeAsync(() => {
      component.onPageChange({ pageIndex: 1, pageSize: 50, length: 200 });
      tick();

      expect(component.currentPage()).toBe(2);
      expect(mockVacancyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 50 })
      );
    }));

    it('should handle page size change', fakeAsync(() => {
      component.onPageChange({ pageIndex: 0, pageSize: 100, length: 200 });
      tick();

      expect(component.pageSize()).toBe(100);
      expect(mockVacancyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 100 })
      );
    }));
  });

  describe('Navigation', () => {
    it('should navigate to vacancy detail', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.goToDetail(mockVacancies[0]);

      expect(navigateSpy).toHaveBeenCalledWith(['/vacancies', 1]);
    });
  });

  describe('Utility methods', () => {
    it('should format date', () => {
      const formatted = component.formatDate('2025-01-15');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2025');
    });

    it('should get source label', () => {
      expect(component.getSourceLabel('linkedin')).toBe('LinkedIn');
      expect(component.getSourceLabel('indeed')).toBe('Indeed');
    });
  });

  describe('Error handling', () => {
    it('should handle load error', fakeAsync(() => {
      mockVacancyService.getAll.mockReturnValue(throwError(() => new Error('Load failed')));

      fixture.detectChanges();
      tick();

      expect(component.isLoading()).toBe(false);
    }));
  });
});
