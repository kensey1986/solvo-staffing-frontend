/**
 * Companies List Component Tests
 *
 * Unit tests for CompaniesListComponent covering rendering,
 * filtering, pagination, and modal interactions.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, delay } from 'rxjs';

import { CompaniesListComponent } from './companies-list.component';
import { COMPANY_SERVICE } from '@core';
import { Company, Country, PaginatedResponse } from '@core';

// Mock company data
const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Test Company 1',
    industry: 'technology',
    location: 'Miami, FL',
    relationshipType: 'client',
    pipelineStage: 'client',
    website: 'https://test1.com',
    contacts: [],
    research: { completenessPercent: 50 },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 2,
    name: 'Test Company 2',
    industry: 'healthcare',
    location: 'Houston, TX',
    relationshipType: 'prospect',
    pipelineStage: 'prospecting',
    website: 'https://test2.com',
    contacts: [],
    research: { completenessPercent: 30 },
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
  },
];

const mockPaginatedResponse: PaginatedResponse<Company> = {
  data: mockCompanies,
  total: 100,
  page: 1,
  pageSize: 20,
  totalPages: 5,
};

// Mock company service
const createMockCompanyService = () => ({
  getAll: jest.fn().mockReturnValue(of(mockPaginatedResponse)),
  create: jest.fn().mockReturnValue(of(mockCompanies[0])),
  investigate: jest.fn().mockReturnValue(of(mockCompanies[0])),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  changeState: jest.fn(),
  getStateHistory: jest.fn(),
  getVacancies: jest.fn(),
  createContact: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
  updateResearch: jest.fn(),
});

let mockCompanyService: ReturnType<typeof createMockCompanyService>;

describe('CompaniesListComponent', () => {
  let component: CompaniesListComponent;
  let fixture: ComponentFixture<CompaniesListComponent>;
  let router: Router;

  beforeEach(async () => {
    // Create fresh mock for each test
    mockCompanyService = createMockCompanyService();

    await TestBed.configureTestingModule({
      imports: [CompaniesListComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    })
      // Override the component's provider
      .overrideComponent(CompaniesListComponent, {
        set: {
          providers: [{ provide: COMPANY_SERVICE, useValue: mockCompanyService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CompaniesListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============= Initialization Tests =============

  describe('Initialization', () => {
    it('should load companies on init', fakeAsync(() => {
      fixture.detectChanges(); // triggers ngOnInit
      tick();

      expect(mockCompanyService.getAll).toHaveBeenCalled();
      expect(component.companies().length).toBe(2);
      expect(component.totalItems()).toBe(100);
    }));

    it('should set loading state while fetching data', fakeAsync(() => {
      // Make the service return with delay to observe loading state
      mockCompanyService.getAll.mockReturnValue(of(mockPaginatedResponse).pipe(delay(100)));

      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      tick(100);
      expect(component.isLoading()).toBe(false);
    }));

    it('should have correct default pagination values', () => {
      expect(component.currentPage()).toBe(1);
      expect(component.pageSize()).toBe(20);
    });

    it('should have empty filters by default', () => {
      expect(component.searchFilter()).toBe('');
      expect(component.relationshipTypeFilter()).toBe('');
      expect(component.pipelineFilter()).toBe('');
    });
  });

  // ============= Filtering Tests =============

  describe('Filtering', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
      mockCompanyService.getAll.mockClear();
    }));

    it('should apply search filter', fakeAsync(() => {
      component.searchFilter.set('TechCorp');
      component.applyFilters();
      tick();

      expect(mockCompanyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'TechCorp' })
      );
    }));

    it('should apply relationship type filter', fakeAsync(() => {
      component.relationshipTypeFilter.set('client');
      component.applyFilters();
      tick();

      expect(mockCompanyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ relationshipType: 'client' })
      );
    }));

    it('should apply pipeline filter', fakeAsync(() => {
      component.pipelineFilter.set('prospecting');
      component.applyFilters();
      tick();

      expect(mockCompanyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ pipelineStage: 'prospecting' })
      );
    }));

    it('should reset page to 1 when applying filters', fakeAsync(() => {
      component.currentPage.set(3);
      component.applyFilters();
      tick();

      expect(component.currentPage()).toBe(1);
    }));

    it('should clear all filters', fakeAsync(() => {
      component.searchFilter.set('test');
      component.relationshipTypeFilter.set('client');
      component.pipelineFilter.set('lead');

      component.clearFilters();
      tick();

      expect(component.searchFilter()).toBe('');
      expect(component.relationshipTypeFilter()).toBe('');
      expect(component.pipelineFilter()).toBe('');
    }));

    it('should reload companies after clearing filters', fakeAsync(() => {
      component.searchFilter.set('test');
      component.clearFilters();
      tick();

      expect(mockCompanyService.getAll).toHaveBeenCalled();
    }));
  });

  // ============= Pagination Tests =============

  describe('Pagination', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
      mockCompanyService.getAll.mockClear();
    }));

    it('should handle page change', fakeAsync(() => {
      component.onPageChange({ pageIndex: 2, pageSize: 20, length: 100 });
      tick();

      expect(component.currentPage()).toBe(3);
      expect(mockCompanyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, pageSize: 20 })
      );
    }));

    it('should handle page size change', fakeAsync(() => {
      component.onPageChange({ pageIndex: 0, pageSize: 50, length: 100 });
      tick();

      expect(component.pageSize()).toBe(50);
      expect(mockCompanyService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 50 })
      );
    }));

    it('should display correct pagination info', fakeAsync(() => {
      component.totalItems.set(100);
      component.currentPage.set(1);
      component.pageSize.set(20);

      expect(component.paginationInfo()).toContain('1');
      expect(component.paginationInfo()).toContain('20');
      expect(component.paginationInfo()).toContain('100');
    }));

    it('should show "No companies found" when total is 0', () => {
      component.totalItems.set(0);
      expect(component.paginationInfo()).toBe('No companies found');
    });
  });

  // ============= Navigation Tests =============

  describe('Navigation', () => {
    it('should navigate to company detail', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      const company = mockCompanies[0];

      component.goToDetail(company);

      expect(navigateSpy).toHaveBeenCalledWith(['/companies', company.id]);
    });
  });

  // ============= Create Modal Tests =============

  describe('Create Modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open create modal', () => {
      component.openCreateModal();
      expect(component.showCreateModal()).toBe(true);
    });

    it('should close create modal', () => {
      component.showCreateModal.set(true);
      component.closeCreateModal();
      expect(component.showCreateModal()).toBe(false);
    });

    it('should reset form when opening create modal', () => {
      component.createForm.set({
        name: 'Previous Value',
        website: 'https://previous.com',
      });

      component.openCreateModal();

      expect(component.createForm().name).toBe('');
      expect(component.createForm().website).toBe('');
    });

    it('should create company successfully', fakeAsync(() => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.createForm.set({ name: 'New Company' });

      component.createCompany();
      tick();

      expect(mockCompanyService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Company' })
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/companies', mockCompanies[0].id]);
    }));

    it('should not create company without name', fakeAsync(() => {
      component.createForm.set({ name: '' });
      component.createCompany();
      tick();

      expect(mockCompanyService.create).not.toHaveBeenCalled();
    }));

    it('should not create company with whitespace-only name', fakeAsync(() => {
      component.createForm.set({ name: '   ' });
      component.createCompany();
      tick();

      expect(mockCompanyService.create).not.toHaveBeenCalled();
    }));

    it('should handle create error', fakeAsync(() => {
      mockCompanyService.create.mockReturnValue(throwError(() => new Error('Create failed')));
      component.createForm.set({ name: 'Test' });

      component.createCompany();
      tick();

      expect(mockCompanyService.create).toHaveBeenCalled();
      // Should not crash, error is handled
    }));

    it('should update create form field', () => {
      component.updateCreateForm('name', 'Updated Name');
      expect(component.createForm().name).toBe('Updated Name');

      component.updateCreateForm('industry', 'technology');
      expect(component.createForm().industry).toBe('technology');
    });
  });

  // ============= Investigate Modal Tests =============

  describe('Investigate Modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open investigate modal', () => {
      component.openInvestigateModal();
      expect(component.showInvestigateModal()).toBe(true);
    });

    it('should close investigate modal', () => {
      component.showInvestigateModal.set(true);
      component.closeInvestigateModal();
      expect(component.showInvestigateModal()).toBe(false);
    });

    it('should reset form when opening investigate modal', () => {
      component.investigateForm.set({
        name: 'Previous',
        country: 'Mexico',
        website: 'https://previous.com',
      });

      component.openInvestigateModal();

      expect(component.investigateForm().name).toBe('');
      expect(component.investigateForm().country).toBe('USA');
      expect(component.investigateForm().website).toBe('');
    });

    it('should investigate company successfully', fakeAsync(() => {
      mockCompanyService.getAll.mockClear();

      component.investigateForm.set({
        name: 'Company to Investigate',
        country: 'USA',
        website: 'https://investigate.com',
      });

      component.investigateCompany();
      tick();

      expect(mockCompanyService.investigate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Company to Investigate',
          country: 'USA',
        })
      );
      expect(component.showInvestigateModal()).toBe(false);
    }));

    it('should not investigate without name', fakeAsync(() => {
      component.investigateForm.set({ name: '', country: 'USA' });
      component.investigateCompany();
      tick();

      expect(mockCompanyService.investigate).not.toHaveBeenCalled();
    }));

    it('should not investigate without country', fakeAsync(() => {
      component.investigateForm.set({ name: 'Test Company', country: '' as Country });
      component.investigateCompany();
      tick();

      expect(mockCompanyService.investigate).not.toHaveBeenCalled();
    }));

    it('should update investigate form field', () => {
      component.updateInvestigateForm('name', 'Updated Name');
      expect(component.investigateForm().name).toBe('Updated Name');

      component.updateInvestigateForm('country', 'Mexico');
      expect(component.investigateForm().country).toBe('Mexico');
    });

    it('should handle investigate error', fakeAsync(() => {
      mockCompanyService.investigate.mockReturnValue(
        throwError(() => new Error('Investigate failed'))
      );
      component.investigateForm.set({ name: 'Test', country: 'USA' });

      component.investigateCompany();
      tick();

      expect(mockCompanyService.investigate).toHaveBeenCalled();
      // Should not crash, error is handled
    }));
  });

  // ============= Utility Methods Tests =============

  describe('Utility Methods', () => {
    it('should get industry label', () => {
      expect(component.getIndustryLabel('technology')).toBe('Technology');
      expect(component.getIndustryLabel('healthcare')).toBe('Healthcare');
      expect(component.getIndustryLabel(undefined)).toBe('-');
      expect(component.getIndustryLabel('unknown')).toBe('unknown');
    });

    it('should close create modal on overlay click', () => {
      component.showCreateModal.set(true);

      const mockEvent = {
        target: { classList: { contains: () => true } },
      } as unknown as MouseEvent;

      component.onModalOverlayClick(mockEvent, 'create');
      expect(component.showCreateModal()).toBe(false);
    });

    it('should close investigate modal on overlay click', () => {
      component.showInvestigateModal.set(true);

      const mockEvent = {
        target: { classList: { contains: () => true } },
      } as unknown as MouseEvent;

      component.onModalOverlayClick(mockEvent, 'investigate');
      expect(component.showInvestigateModal()).toBe(false);
    });

    it('should close create modal on ESC key', () => {
      component.showCreateModal.set(true);

      const mockEvent = { key: 'Escape' } as KeyboardEvent;
      component.onModalKeydown(mockEvent, 'create');

      expect(component.showCreateModal()).toBe(false);
    });

    it('should close investigate modal on ESC key', () => {
      component.showInvestigateModal.set(true);

      const mockEvent = { key: 'Escape' } as KeyboardEvent;
      component.onModalKeydown(mockEvent, 'investigate');

      expect(component.showInvestigateModal()).toBe(false);
    });
  });

  // ============= Error Handling Tests =============

  describe('Error Handling', () => {
    it('should handle load error gracefully', fakeAsync(() => {
      mockCompanyService.getAll.mockReturnValue(throwError(() => new Error('Load failed')));

      fixture.detectChanges();
      tick();

      // Component should handle error and reset loading state
      expect(component.isLoading()).toBe(false);
    }));
  });

  // ============= Filter Options Tests =============

  describe('Filter Options', () => {
    it('should have relationship type options', () => {
      expect(component.relationshipTypeOptions.length).toBeGreaterThan(0);
      expect(component.relationshipTypeOptions[0].value).toBe('');
      expect(component.relationshipTypeOptions[0].label).toBe('Todos');
    });

    it('should have pipeline options', () => {
      expect(component.pipelineOptions.length).toBeGreaterThan(0);
      expect(component.pipelineOptions[0].value).toBe('');
      expect(component.pipelineOptions[0].label).toBe('Todos');
    });

    it('should have industry options', () => {
      expect(component.industryOptions.length).toBeGreaterThan(0);
      expect(component.industryOptions.some(o => o.value === 'technology')).toBe(true);
    });

    it('should have country options for investigate', () => {
      expect(component.countryOptions.length).toBeGreaterThan(0);
      expect(component.countryOptions.some(o => o.value === 'USA')).toBe(true);
    });
  });

  // ============= Table Columns Tests =============

  describe('Table Configuration', () => {
    it('should have correct displayed columns', () => {
      expect(component.displayedColumns).toContain('name');
      expect(component.displayedColumns).toContain('industry');
      expect(component.displayedColumns).toContain('location');
      expect(component.displayedColumns).toContain('relationshipType');
      expect(component.displayedColumns).toContain('pipelineStage');
      expect(component.displayedColumns).toContain('actions');
    });
  });
});
