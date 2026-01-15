/**
 * Company Detail Component Tests
 *
 * Unit tests for CompanyDetailComponent covering:
 * - Loading company data
 * - Edit company modal
 * - Edit research modal
 * - State change modal
 * - Utility methods
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CompanyDetailComponent } from './company-detail.component';
import { COMPANY_SERVICE } from '@core';
import { Company, CompanyStateChange, CompanyResearch } from '@core';
import { Vacancy } from '@core';

// Mock company data
const mockCompany: Company = {
  id: 1,
  name: 'Test Company',
  industry: 'technology',
  location: 'Miami, FL',
  relationshipType: 'client',
  pipelineStage: 'client',
  website: 'https://test.com',
  phone: '+1234567890',
  country: 'USA',
  employees: '1-50',
  contacts: [
    {
      id: 1,
      name: 'John Doe',
      title: 'CEO',
      email: 'john@test.com',
      phone: '+1111111111',
      isPrimary: true,
    },
  ],
  research: {
    completenessPercent: 75,
    valueProposition: 'Test value proposition',
    mission: 'Test mission',
    vision: 'Test vision',
    salesPitch: 'Test sales pitch',
  },
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockStateHistory: CompanyStateChange[] = [
  {
    id: 1,
    fromState: 'prospecting',
    toState: 'engaged',
    changedAt: '2025-01-15',
    changedBy: 'Admin User',
    note: 'First contact',
    tags: ['priority'],
  },
];

const mockVacancies: Vacancy[] = [
  {
    id: 1,
    jobTitle: 'Software Engineer',
    companyId: 1,
    companyName: 'Test Company',
    location: 'Remote',
    status: 'active',
    pipelineStage: 'active_search',
    workMode: 'remote',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
  },
];

// Mock service factory
const createMockCompanyService = () => ({
  getById: jest.fn().mockReturnValue(of(mockCompany)),
  getStateHistory: jest.fn().mockReturnValue(of(mockStateHistory)),
  getVacancies: jest.fn().mockReturnValue(of(mockVacancies)),
  update: jest.fn().mockReturnValue(of(mockCompany)),
  updateResearch: jest.fn().mockReturnValue(of(mockCompany.research)),
  changeState: jest.fn().mockReturnValue(of(mockCompany)),
  getAll: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  investigate: jest.fn(),
  createContact: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
});

describe('CompanyDetailComponent', () => {
  let component: CompanyDetailComponent;
  let fixture: ComponentFixture<CompanyDetailComponent>;
  let router: Router;
  let mockCompanyService: ReturnType<typeof createMockCompanyService>;
  let mockActivatedRoute: { snapshot: { paramMap: { get: jest.Mock } } };

  beforeEach(async () => {
    mockCompanyService = createMockCompanyService();
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [CompanyDetailComponent, NoopAnimationsModule],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: mockActivatedRoute }],
    })
      .overrideComponent(CompanyDetailComponent, {
        set: {
          providers: [{ provide: COMPANY_SERVICE, useValue: mockCompanyService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CompanyDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============= Initialization Tests =============

  describe('Initialization', () => {
    it('should load company on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockCompanyService.getById).toHaveBeenCalledWith(1);
      expect(component.company()).toEqual(mockCompany);
      expect(component.isLoading()).toBe(false);
    }));

    it('should load state history after company loads', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockCompanyService.getStateHistory).toHaveBeenCalledWith(1, {});
      expect(component.stateHistory()).toEqual(mockStateHistory);
    }));

    it('should load vacancies after company loads', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockCompanyService.getVacancies).toHaveBeenCalledWith(1);
      expect(component.vacancies()).toEqual(mockVacancies);
    }));

    it('should redirect to companies list if no ID', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.detectChanges();
      tick();

      expect(navigateSpy).toHaveBeenCalledWith(['/companies']);
    }));

    it('should handle load error', fakeAsync(() => {
      mockCompanyService.getById.mockReturnValue(throwError(() => new Error('Load failed')));

      fixture.detectChanges();
      tick();

      expect(component.isLoading()).toBe(false);
    }));
  });

  // ============= Computed Properties Tests =============

  describe('Computed Properties', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should compute page title', () => {
      expect(component.pageTitle()).toBe('Test Company');
    });

    it('should return default page title when no company', () => {
      component.company.set(null);
      expect(component.pageTitle()).toBe('Company Detail');
    });

    it('should compute industry label', () => {
      expect(component.industryLabel()).toBe('Technology');
    });

    it('should return N/A for missing industry', () => {
      const companyWithoutIndustry = { ...mockCompany, industry: undefined };
      component.company.set(companyWithoutIndustry as Company);
      expect(component.industryLabel()).toBe('N/A');
    });

    it('should generate state options', () => {
      const options = component.stateOptions();
      expect(options.length).toBe(6);
      expect(options[0].value).toBe('lead');
      expect(options[0].label).toBe('Lead');
    });

    it('should compute size label', () => {
      const label = component.sizeLabel();
      expect(label).toBe('1-50');
    });

    it('should return N/A for missing size', () => {
      const companyWithoutSize = { ...mockCompany, employees: undefined };
      component.company.set(companyWithoutSize as Company);
      expect(component.sizeLabel()).toBe('N/A');
    });

    it('should compute country label', () => {
      const label = component.countryLabel();
      expect(label).toBe('USA');
    });

    it('should return N/A for missing country', () => {
      const companyWithoutCountry = { ...mockCompany, country: undefined };
      component.company.set(companyWithoutCountry as Company);
      expect(component.countryLabel()).toBe('N/A');
    });
  });

  // ============= Edit Company Modal Tests =============

  describe('Edit Company Modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open edit modal with company data', () => {
      component.openEditModal();

      expect(component.showEditModal()).toBe(true);
      expect(component.editName()).toBe('Test Company');
      expect(component.editWebsite()).toBe('https://test.com');
    });

    it('should close edit modal', () => {
      component.showEditModal.set(true);
      component.closeEditModal();

      expect(component.showEditModal()).toBe(false);
    });

    it('should save company changes', fakeAsync(() => {
      const updatedCompany = { ...mockCompany, name: 'Updated Company' };
      mockCompanyService.update.mockReturnValue(of(updatedCompany));

      component.openEditModal();
      component.editName.set('Updated Company');
      component.saveCompany();
      tick();

      expect(mockCompanyService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: 'Updated Company' })
      );
      expect(component.company()?.name).toBe('Updated Company');
      expect(component.showEditModal()).toBe(false);
    }));

    it('should handle save error', fakeAsync(() => {
      mockCompanyService.update.mockReturnValue(throwError(() => new Error('Save failed')));

      component.openEditModal();
      component.saveCompany();
      tick();

      expect(mockCompanyService.update).toHaveBeenCalled();
    }));

    it('should not open edit modal if no company', () => {
      component.company.set(null);
      component.showEditModal.set(false);
      component.openEditModal();
      expect(component.showEditModal()).toBe(false);
    });

    it('should handle company with missing optional fields in edit modal', fakeAsync(() => {
      // Company without website, phone, location
      const companyWithMissingFields = {
        ...mockCompany,
        website: undefined,
        phone: undefined,
        location: undefined,
      };
      component.company.set(companyWithMissingFields as Company);

      component.openEditModal();

      expect(component.editWebsite()).toBe('');
      expect(component.editPhone()).toBe('');
      expect(component.editLocation()).toBe('');
    }));

    it('should send undefined for empty optional fields when saving', fakeAsync(() => {
      const updatedCompany = { ...mockCompany, website: undefined };
      mockCompanyService.update.mockReturnValue(of(updatedCompany));

      component.openEditModal();
      component.editWebsite.set('');
      component.editPhone.set('');
      component.editLocation.set('');
      component.saveCompany();
      tick();

      expect(mockCompanyService.update).toHaveBeenCalledWith(1, {
        name: 'Test Company',
        website: undefined,
        phone: undefined,
        location: undefined,
      });
    }));
  });

  // ============= Edit Research Modal Tests =============

  describe('Edit Research Modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open research modal with current data', () => {
      component.openResearchModal();

      expect(component.showResearchModal()).toBe(true);
      expect(component.editValueProposition()).toBe('Test value proposition');
      expect(component.editMission()).toBe('Test mission');
    });

    it('should close research modal', () => {
      component.showResearchModal.set(true);
      component.closeResearchModal();

      expect(component.showResearchModal()).toBe(false);
    });

    it('should save research changes', fakeAsync(() => {
      const updatedResearch: CompanyResearch = {
        ...mockCompany.research!,
        mission: 'Updated mission',
      };
      mockCompanyService.updateResearch.mockReturnValue(of(updatedResearch));

      component.openResearchModal();
      component.editMission.set('Updated mission');
      component.saveResearch();
      tick();

      expect(mockCompanyService.updateResearch).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ mission: 'Updated mission' })
      );
      expect(component.showResearchModal()).toBe(false);
    }));

    it('should handle research save error', fakeAsync(() => {
      mockCompanyService.updateResearch.mockReturnValue(throwError(() => new Error('Save failed')));

      component.openResearchModal();
      component.saveResearch();
      tick();

      expect(mockCompanyService.updateResearch).toHaveBeenCalled();
    }));

    it('should open research modal with empty values if no research', () => {
      const companyWithoutResearch = { ...mockCompany, research: undefined };
      component.company.set(companyWithoutResearch as Company);

      component.openResearchModal();

      expect(component.showResearchModal()).toBe(true);
      expect(component.editValueProposition()).toBe('');
      expect(component.editMission()).toBe('');
    });

    it('should send undefined for empty optional research fields when saving', fakeAsync(() => {
      const updatedResearch: CompanyResearch = { completenessPercent: 0 };
      mockCompanyService.updateResearch.mockReturnValue(of(updatedResearch));

      component.openResearchModal();
      component.editValueProposition.set('');
      component.editMission.set('');
      component.editVision.set('');
      component.editSalesPitch.set('');
      component.saveResearch();
      tick();

      expect(mockCompanyService.updateResearch).toHaveBeenCalledWith(1, {
        valueProposition: undefined,
        mission: undefined,
        vision: undefined,
        salesPitch: undefined,
      });
    }));

    it('should update company with new research on save success', fakeAsync(() => {
      const updatedResearch: CompanyResearch = {
        completenessPercent: 100,
        valueProposition: 'New VP',
        mission: 'New Mission',
        vision: 'New Vision',
        salesPitch: 'New Pitch',
      };
      mockCompanyService.updateResearch.mockReturnValue(of(updatedResearch));

      component.openResearchModal();
      component.editValueProposition.set('New VP');
      component.editMission.set('New Mission');
      component.editVision.set('New Vision');
      component.editSalesPitch.set('New Pitch');
      component.saveResearch();
      tick();

      expect(component.company()?.research).toEqual(updatedResearch);
    }));
  });

  // ============= State Change Modal Tests =============

  describe('State Change Modal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open state modal if company exists', () => {
      component.openStateModal();
      expect(component.showStateModal()).toBe(true);
    });

    it('should not open state modal if no company', () => {
      component.company.set(null);
      component.openStateModal();
      expect(component.showStateModal()).toBe(false);
    });

    it('should close state modal', () => {
      component.showStateModal.set(true);
      component.closeStateModal();
      expect(component.showStateModal()).toBe(false);
    });

    it('should handle state change', fakeAsync(() => {
      const updatedCompany = { ...mockCompany, pipelineStage: 'proposal' as const };
      mockCompanyService.changeState.mockReturnValue(of(updatedCompany));

      component.onStateChange({
        newState: 'proposal',
        note: 'Test note',
        tags: ['urgent'],
      });
      tick();

      expect(mockCompanyService.changeState).toHaveBeenCalledWith(1, {
        newState: 'proposal',
        note: 'Test note',
        tags: ['urgent'],
      });
      expect(component.company()?.pipelineStage).toBe('proposal');
      expect(component.showStateModal()).toBe(false);
    }));

    it('should reload history after state change', fakeAsync(() => {
      const updatedCompany = { ...mockCompany, pipelineStage: 'proposal' as const };
      mockCompanyService.changeState.mockReturnValue(of(updatedCompany));
      mockCompanyService.getStateHistory.mockClear();

      component.onStateChange({ newState: 'proposal' });
      tick();

      expect(mockCompanyService.getStateHistory).toHaveBeenCalledWith(1, {});
    }));

    it('should handle state change error', fakeAsync(() => {
      mockCompanyService.changeState.mockReturnValue(throwError(() => new Error('Change failed')));

      component.onStateChange({ newState: 'proposal' });
      tick();

      expect(mockCompanyService.changeState).toHaveBeenCalled();
    }));

    it('should not change state if no new state', fakeAsync(() => {
      mockCompanyService.changeState.mockClear();
      component.onStateChange({ newState: undefined });
      tick();

      expect(mockCompanyService.changeState).not.toHaveBeenCalled();
    }));
  });

  // ============= Utility Methods Tests =============

  describe('Utility Methods', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should format date correctly', () => {
      const formatted = component.formatDate('2025-01-15');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2025');
    });

    it('should return N/A for missing date', () => {
      expect(component.formatDate(undefined)).toBe('N/A');
    });

    it('should get pipeline label', () => {
      expect(component.getPipelineLabel('lead')).toBe('Lead');
      expect(component.getPipelineLabel('client')).toBe('Client');
    });

    it('should return raw value for unknown pipeline stage', () => {
      expect(component.getPipelineLabel('unknown')).toBe('unknown');
    });

    it('should get vacancy pipeline label', () => {
      expect(component.getVacancyPipelineLabel('detected')).toBe('Detected');
      expect(component.getVacancyPipelineLabel('contacted')).toBe('Contacted');
    });

    it('should calculate research completeness', () => {
      expect(component.getResearchCompleteness()).toBe(75);
    });

    it('should return 0 for missing research completeness', () => {
      const companyWithoutCompleteness = {
        ...mockCompany,
        research: { ...mockCompany.research, completenessPercent: undefined },
      };
      component.company.set(companyWithoutCompleteness as Company);
      expect(component.getResearchCompleteness()).toBe(0);
    });

    it('should navigate to vacancy detail', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.navigateToVacancy(5);
      expect(navigateSpy).toHaveBeenCalledWith(['/vacancies', 5]);
    });
  });

  // ============= Table Configuration Tests =============

  describe('Table Configuration', () => {
    it('should have correct history columns', () => {
      expect(component.historyColumns).toContain('date');
      expect(component.historyColumns).toContain('user');
      expect(component.historyColumns).toContain('change');
      expect(component.historyColumns).toContain('note');
      expect(component.historyColumns).toContain('tags');
    });

    it('should have correct contacts columns', () => {
      expect(component.contactsColumns).toContain('name');
      expect(component.contactsColumns).toContain('title');
      expect(component.contactsColumns).toContain('email');
    });

    it('should have correct vacancies columns', () => {
      expect(component.vacanciesColumns).toContain('jobTitle');
      expect(component.vacanciesColumns).toContain('location');
      expect(component.vacanciesColumns).toContain('status');
    });
  });

  // ============= Tab State Tests =============

  describe('Tab State', () => {
    it('should have default tab index of 0', () => {
      expect(component.selectedTabIndex()).toBe(0);
    });
  });

  // ============= Error Handling Tests =============

  describe('Error Handling', () => {
    it('should handle state history load error', fakeAsync(() => {
      mockCompanyService.getStateHistory.mockReturnValue(
        throwError(() => new Error('History failed'))
      );

      fixture.detectChanges();
      tick();

      expect(component.stateHistory()).toEqual([]);
    }));

    it('should handle vacancies load error', fakeAsync(() => {
      mockCompanyService.getVacancies.mockReturnValue(
        throwError(() => new Error('Vacancies failed'))
      );

      fixture.detectChanges();
      tick();

      expect(component.vacancies()).toEqual([]);
    }));
  });
});
