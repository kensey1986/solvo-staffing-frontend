/**
 * Vacancy Detail Component Tests
 *
 * Unit tests for VacancyDetailComponent covering:
 * - Loading vacancy data
 * - State change modal
 * - Utility methods
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { VacancyDetailComponent } from './vacancy-detail.component';
import { VACANCY_SERVICE, Vacancy, VacancyStateChange } from '@core';

const mockVacancy: Vacancy = {
  id: 1,
  jobTitle: 'Software Engineer',
  companyId: 10,
  companyName: 'Acme',
  location: 'Remote',
  status: 'active',
  pipelineStage: 'detected',
  source: 'linkedin',
  publishedDate: '2025-01-01',
};

const mockStateHistory: VacancyStateChange[] = [
  {
    date: '2025-01-10',
    user: 'Admin',
    fromState: 'detected',
    toState: 'contacted',
    note: 'Contacted candidate',
    tags: ['priority'],
  },
];

const createMockVacancyService = () => ({
  getById: jest.fn().mockReturnValue(of(mockVacancy)),
  getStateHistory: jest.fn().mockReturnValue(of(mockStateHistory)),
  changeState: jest.fn().mockReturnValue(of({ ...mockVacancy, pipelineStage: 'proposal' })),
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('VacancyDetailComponent', () => {
  let component: VacancyDetailComponent;
  let fixture: ComponentFixture<VacancyDetailComponent>;
  let router: Router;
  let mockVacancyService: ReturnType<typeof createMockVacancyService>;
  let mockActivatedRoute: { snapshot: { paramMap: { get: jest.Mock } } };

  beforeEach(async () => {
    mockVacancyService = createMockVacancyService();
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [VacancyDetailComponent, NoopAnimationsModule],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: mockActivatedRoute }],
    })
      .overrideComponent(VacancyDetailComponent, {
        set: {
          providers: [{ provide: VACANCY_SERVICE, useValue: mockVacancyService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VacancyDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load vacancy on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockVacancyService.getById).toHaveBeenCalledWith(1);
      expect(component.vacancy()).toEqual(mockVacancy);
      expect(component.isLoading()).toBe(false);
    }));

    it('should load state history after vacancy loads', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockVacancyService.getStateHistory).toHaveBeenCalledWith(1);
      expect(component.stateHistory()).toEqual(mockStateHistory);
    }));

    it('should not load when no id', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      fixture.detectChanges();
      tick();

      expect(mockVacancyService.getById).not.toHaveBeenCalled();
    }));

    it('should handle load error and navigate', fakeAsync(() => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      mockVacancyService.getById.mockReturnValue(throwError(() => new Error('Load failed')));

      fixture.detectChanges();
      tick();

      expect(component.isLoading()).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/vacancies']);
    }));
  });

  describe('State change modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open state modal when vacancy exists', () => {
      component.openStateChangeDialog();
      expect(component.showStateModal()).toBe(true);
    });

    it('should close state modal', () => {
      component.showStateModal.set(true);
      component.closeStateModal();
      expect(component.showStateModal()).toBe(false);
    });

    it('should handle state change', fakeAsync(() => {
      component.onStateChange({ newState: 'proposal', note: 'Test', tags: [] });
      tick();

      expect(mockVacancyService.changeState).toHaveBeenCalledWith(1, {
        newState: 'proposal',
        note: 'Test',
        tags: [],
      });
      expect(component.showStateModal()).toBe(false);
    }));

    it('should handle state change error', fakeAsync(() => {
      mockVacancyService.changeState.mockReturnValue(throwError(() => new Error('Change failed')));

      component.onStateChange({ newState: 'proposal', note: 'Test', tags: [] });
      tick();

      expect(mockVacancyService.changeState).toHaveBeenCalled();
    }));

    it('should not change state if no new state', fakeAsync(() => {
      mockVacancyService.changeState.mockClear();
      component.onStateChange({ newState: undefined, note: 'Test', tags: [] });
      tick();

      expect(mockVacancyService.changeState).not.toHaveBeenCalled();
    }));
  });

  describe('Edit vacancy modal', () => {
    it('should open edit modal when vacancy exists', () => {
      component.vacancy.set(mockVacancy);
      component.openEditDialog();
      expect(component.showEditModal()).toBe(true);
    });

    it('should not open edit modal when vacancy is null', () => {
      component.vacancy.set(null);
      component.openEditDialog();
      expect(component.showEditModal()).toBe(false);
    });

    it('should close edit modal', () => {
      component.showEditModal.set(true);
      component.closeEditModal();
      expect(component.showEditModal()).toBe(false);
    });

    it('should update vacancy on edit submit', fakeAsync(() => {
      mockVacancyService.update.mockReturnValue(of({ ...mockVacancy, jobTitle: 'Updated Title' }));

      component.showEditModal.set(true);
      component.onEditSubmit({
        jobTitle: 'Updated Title',
        status: 'active',
        department: 'Engineering',
        seniorityLevel: 'senior',
        salaryRange: '$100k-$120k',
        notes: 'Updated notes',
      });
      tick();

      expect(mockVacancyService.update).toHaveBeenCalledWith(1, {
        jobTitle: 'Updated Title',
        status: 'active',
        department: 'Engineering',
        seniorityLevel: 'senior',
        salaryRange: '$100k-$120k',
        notes: 'Updated notes',
      });
      expect(component.vacancy()?.jobTitle).toBe('Updated Title');
      expect(component.showEditModal()).toBe(false);
    }));

    it('should handle edit submit error', fakeAsync(() => {
      mockVacancyService.update.mockReturnValue(throwError(() => new Error('Update failed')));

      component.showEditModal.set(true);
      component.onEditSubmit({
        jobTitle: 'Updated Title',
        status: 'active',
        department: 'Engineering',
        seniorityLevel: 'senior',
        salaryRange: '$100k-$120k',
        notes: 'Updated notes',
      });
      tick();

      expect(mockVacancyService.update).toHaveBeenCalled();
      expect(component.showEditModal()).toBe(true);
    }));

    it('should not submit edit when id is missing', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      mockVacancyService.update.mockClear();

      component.onEditSubmit({
        jobTitle: 'Updated Title',
        status: 'active',
        department: 'Engineering',
        seniorityLevel: 'senior',
        salaryRange: '$100k-$120k',
        notes: 'Updated notes',
      });
      tick();

      expect(mockVacancyService.update).not.toHaveBeenCalled();
    }));
  });

  describe('Utility methods', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should compute page title', () => {
      expect(component.pageTitle()).toBe('Software Engineer');
    });

    it('should compute source label', () => {
      expect(component.sourceLabel()).toBe('LinkedIn');
    });

    it('should format date', () => {
      const formatted = component.formatDate('2025-01-15');
      expect(formatted).toContain('Jan');
    });

    it('should format datetime', () => {
      const formatted = component.formatDateTime('2025-01-15T10:30:00Z');
      expect(formatted).toContain('Jan');
    });

    it('should get pipeline label', () => {
      expect(component.getPipelineLabel('detected')).toBe('Detected');
    });

    it('should get remote viable text', () => {
      expect(component.getRemoteViableText(true)).toBe('Yes');
      expect(component.getRemoteViableText(false)).toBe('No');
      expect(component.getRemoteViableText(undefined)).toBe('N/A');
    });
  });

  describe('Error handling', () => {
    it('should handle state history load error', fakeAsync(() => {
      mockVacancyService.getStateHistory.mockReturnValue(
        throwError(() => new Error('History failed'))
      );

      fixture.detectChanges();
      tick();

      expect(component.stateHistory()).toEqual([]);
    }));
  });
});
