/**
 * Company Mock Service Tests
 *
 * Unit tests for CompanyMockService covering CRUD operations,
 * state changes, filtering, pagination, and contact management.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompanyMockService } from './company-mock.service';
import {
  ChangeCompanyStateDto,
  CompanyFilterParams,
  CreateCompanyDto,
  CreateContactDto,
  UpdateContactDto,
  UpdateCompanyDto,
  UpdateResearchDto,
} from '../../dtos/company.dto';
import { Company, CompanyStateChange, Contact, Research } from '../../models/company.model';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy } from '../../models/vacancy.model';

describe('CompanyMockService', () => {
  let service: CompanyMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyMockService],
    });
    service = TestBed.inject(CompanyMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============= getAll Tests =============

  describe('getAll', () => {
    it('should return paginated companies', fakeAsync(() => {
      let result: PaginatedResponse<Company> | null = null;
      service.getAll().subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.data).toBeDefined();
      expect(result!.data.length).toBeGreaterThan(0);
      expect(result!.page).toBe(1);
      expect(result!.pageSize).toBe(20);
      expect(result!.total).toBeDefined();
    }));

    it('should filter by search term', fakeAsync(() => {
      const params: CompanyFilterParams = { search: 'TechCorp' };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      expect(result!.data.length).toBeGreaterThan(0);
      expect(result!.data[0].name.toLowerCase()).toContain('techcorp');
    }));

    it('should filter by relationship type', fakeAsync(() => {
      const params: CompanyFilterParams = { relationshipType: 'client' };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach((company: Company) => {
        expect(company.relationshipType).toBe('client');
      });
    }));

    it('should filter by pipeline stage', fakeAsync(() => {
      const params: CompanyFilterParams = { pipelineStage: 'lead' };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach((company: Company) => {
        expect(company.pipelineStage).toBe('lead');
      });
    }));

    it('should filter by industry', fakeAsync(() => {
      const params: CompanyFilterParams = { industry: 'technology' };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach((company: Company) => {
        expect(company.industry).toBe('technology');
      });
    }));

    it('should filter by location', fakeAsync(() => {
      const params: CompanyFilterParams = { location: 'Miami' };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach((company: Company) => {
        expect((company.location ?? '').toLowerCase()).toContain('miami');
      });
    }));

    it('should paginate results', fakeAsync(() => {
      const params: CompanyFilterParams = { page: 1, pageSize: 5 };
      let result: PaginatedResponse<Company> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      expect(result!.page).toBe(1);
      expect(result!.pageSize).toBe(5);
      expect(result!.data.length).toBeLessThanOrEqual(5);
    }));

    it('should sort companies by name', fakeAsync(() => {
      let result: PaginatedResponse<Company> | null = null;
      service.getAll().subscribe(res => (result = res));
      tick(300);

      const names = result!.data.map((c: Company) => c.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    }));
  });

  // ============= getById Tests =============

  describe('getById', () => {
    it('should return a company by id', fakeAsync(() => {
      let result: Company | null = null;
      service.getById(1).subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(1);
      expect(result!.name).toBeDefined();
    }));

    it('should throw error for non-existent id', fakeAsync(() => {
      expect(() => {
        service.getById(99999);
      }).toThrow();
    }));
  });

  // ============= create Tests =============

  describe('create', () => {
    it('should create a new company', fakeAsync(() => {
      const newCompanyData: CreateCompanyDto = {
        name: 'Test Company',
        website: 'https://testcompany.com',
        industry: 'technology',
        location: 'Test City, TS',
        employees: '50-100',
        phone: '+1 555-1234',
      };

      let result: Company | null = null;
      service.create(newCompanyData).subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.id).toBeDefined();
      expect(result!.name).toBe('Test Company');
      expect(result!.website).toBe('https://testcompany.com');
      expect(result!.relationshipType).toBe('lead');
      expect(result!.pipelineStage).toBe('lead');
      expect(result!.contacts).toEqual([]);
      expect(result!.research?.completenessPercent).toBe(0);
    }));

    it('should add created company to the list', fakeAsync(() => {
      const newCompanyData: CreateCompanyDto = {
        name: 'Another Test Company',
      };

      service.create(newCompanyData).subscribe();
      tick(300);

      let result: PaginatedResponse<Company> | null = null;
      service.getAll({ search: 'Another Test Company' }).subscribe(res => (result = res));
      tick(300);

      expect(result!.data.some((c: Company) => c.name === 'Another Test Company')).toBe(true);
    }));
  });

  // ============= update Tests =============

  describe('update', () => {
    it('should update a company', fakeAsync(() => {
      const updateData: UpdateCompanyDto = {
        name: 'Updated TechCorp',
        phone: '+1 999-9999',
      };

      let result: Company | null = null;
      service.update(1, updateData).subscribe(res => (result = res));
      tick(300);

      expect(result!.name).toBe('Updated TechCorp');
      expect(result!.phone).toBe('+1 999-9999');
      expect(result!.updatedAt).toBeDefined();
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.update(99999, { name: 'Test' });
      }).toThrow();
    }));
  });

  // ============= delete Tests =============

  describe('delete', () => {
    it('should delete a company', fakeAsync(() => {
      // First create a company to delete
      let createdCompany: Company | null = null;
      service.create({ name: 'To Delete' }).subscribe(res => (createdCompany = res));
      tick(300);

      const companyId = createdCompany!.id;

      // Delete the company
      service.delete(companyId).subscribe();
      tick(300);

      // Verify it's deleted
      expect(() => {
        service.getById(companyId);
      }).toThrow();
    }));
  });

  // ============= changeState Tests =============

  describe('changeState', () => {
    it('should change company pipeline state', fakeAsync(() => {
      const stateChangeData: ChangeCompanyStateDto = {
        newState: 'prospecting',
        note: 'Moving to prospecting phase after initial contact',
        tags: ['important', 'Q1-2026'],
      };

      // First get original state
      let originalCompany: Company | null = null;
      service.getById(3).subscribe(res => (originalCompany = res));
      tick(300);
      expect(originalCompany).toBeTruthy();

      // Change state
      let result: Company | null = null;
      service.changeState(3, stateChangeData).subscribe(res => (result = res));
      tick(300);

      expect(result!.pipelineStage).toBe('prospecting');
      expect(result!.updatedAt).toBeDefined();
    }));

    it('should update relationship type when changing to client', fakeAsync(() => {
      const stateChangeData: ChangeCompanyStateDto = {
        newState: 'onboarding_started',
        note: 'Deal closed, now a client',
      };

      let result: Company | null = null;
      service.changeState(3, stateChangeData).subscribe(res => (result = res));
      tick(300);

      expect(result!.pipelineStage).toBe('onboarding_started');
      expect(result!.relationshipType).toBe('client');
    }));

    it('should update relationship type when changing to lost', fakeAsync(() => {
      const stateChangeData: ChangeCompanyStateDto = {
        newState: 'lost',
        note: 'Deal lost to competitor',
      };

      let result: Company | null = null;
      service.changeState(2, stateChangeData).subscribe(res => (result = res));
      tick(300);

      expect(result!.pipelineStage).toBe('lost');
      expect(result!.relationshipType).toBe('inactive');
    }));

    it('should add entry to state history', fakeAsync(() => {
      const stateChangeData: ChangeCompanyStateDto = {
        newState: 'engaged',
        note: 'Good meeting with stakeholders',
        tags: ['meeting', 'positive'],
      };

      service.changeState(2, stateChangeData).subscribe();
      tick(300);

      let history: CompanyStateChange[] | null = null;
      service.getStateHistory(2).subscribe(res => (history = res));
      tick(300);

      expect(history!.length).toBeGreaterThan(0);
      expect(history![0].toState).toBe('engaged');
      expect(history![0].note).toBe('Good meeting with stakeholders');
      expect(history![0].tags).toEqual(['meeting', 'positive']);
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.changeState(99999, { newState: 'onboarding_started', note: 'test' });
      }).toThrow();
    }));
  });

  // ============= getStateHistory Tests =============

  describe('getStateHistory', () => {
    it('should return state history for a company', fakeAsync(() => {
      let history: CompanyStateChange[] | null = null;
      service.getStateHistory(1).subscribe(res => (history = res));
      tick(300);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    }));

    it('should return empty array for company without history', fakeAsync(() => {
      let history: CompanyStateChange[] | null = null;
      service.getStateHistory(99999).subscribe(res => (history = res));
      tick(300);

      expect(history).toEqual([]);
    }));

    it('should filter history by stage', fakeAsync(() => {
      // First add some history entries
      service.changeState(1, { newState: 'prospecting', note: 'test1' }).subscribe();
      tick(300);
      service.changeState(1, { newState: 'engaged', note: 'test2' }).subscribe();
      tick(300);

      let history: CompanyStateChange[] | null = null;
      service.getStateHistory(1, { stage: 'prospecting' }).subscribe(res => (history = res));
      tick(300);

      history!.forEach((entry: CompanyStateChange) => {
        expect(entry.fromState === 'prospecting' || entry.toState === 'prospecting').toBe(true);
      });
    }));

    it('should filter history by user', fakeAsync(() => {
      // Add history entry
      service.changeState(1, { newState: 'initial_appointment_held', note: 'test' }).subscribe();
      tick(300);

      let history: CompanyStateChange[] | null = null;
      service.getStateHistory(1, { user: 'Carlos' }).subscribe(res => (history = res));
      tick(300);

      history!.forEach((entry: CompanyStateChange) => {
        expect(entry.user.toLowerCase()).toContain('carlos');
      });
    }));
  });

  // ============= getVacancies Tests =============

  describe('getVacancies', () => {
    it('should return vacancies for a company', fakeAsync(() => {
      let vacancies: Vacancy[] | null = null;
      service.getVacancies(1).subscribe(res => (vacancies = res));
      tick(300);

      expect(vacancies).toBeDefined();
      expect(Array.isArray(vacancies)).toBe(true);
    }));

    it('should return empty array for company without vacancies', fakeAsync(() => {
      let vacancies: Vacancy[] | null = null;
      service.getVacancies(99999).subscribe(res => (vacancies = res));
      tick(300);

      expect(vacancies).toEqual([]);
    }));
  });

  // ============= updateResearch Tests =============

  describe('updateResearch', () => {
    it('should update company research data', fakeAsync(() => {
      const researchData: UpdateResearchDto = {
        valueProposition: 'New value proposition for testing',
        mission: 'Our testing mission',
        vision: 'Our testing vision',
        salesPitch: 'This is our sales pitch for the test',
      };

      let result: Research | null = null;
      service.updateResearch(2, researchData).subscribe(res => (result = res));
      tick(300);

      expect(result!.valueProposition).toBe('New value proposition for testing');
      expect(result!.mission).toBe('Our testing mission');
      expect(result!.vision).toBe('Our testing vision');
      expect(result!.salesPitch).toBe('This is our sales pitch for the test');
      expect(result!.lastResearchDate).toBeDefined();
      expect(result!.completenessPercent).toBe(100);
    }));

    it('should calculate partial completeness', fakeAsync(() => {
      const researchData: UpdateResearchDto = {
        valueProposition: 'Only value proposition',
        mission: 'And mission',
      };

      let result: Research | null = null;
      service.updateResearch(3, researchData).subscribe(res => (result = res));
      tick(300);

      expect(result!.completenessPercent).toBe(50);
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.updateResearch(99999, { valueProposition: 'test' });
      }).toThrow();
    }));
  });

  // ============= investigate Tests =============

  describe('investigate', () => {
    it('should create company from investigation', fakeAsync(() => {
      const investigateData = {
        name: 'Investigated Company',
        country: 'USA' as const,
        website: 'https://investigated.com',
      };

      let result: Company | null = null;
      service.investigate(investigateData).subscribe(res => (result = res));
      tick(600); // Longer delay for investigate

      expect(result).toBeTruthy();
      expect(result!.id).toBeDefined();
      expect(result!.name).toBe('Investigated Company');
      expect(result!.country).toBe('USA');
      expect(result!.website).toBe('https://investigated.com');
      expect(result!.pipelineStage).toBe('lead');
      expect(result!.relationshipType).toBe('lead');
    }));
  });

  // ============= Contact Management Tests =============

  describe('createContact', () => {
    it('should create a new contact', fakeAsync(() => {
      const contactData: CreateContactDto = {
        fullName: 'Jane Doe',
        jobTitle: 'CTO',
        email: 'jane@example.com',
        phone: '+1 555-5678',
        isPrimary: false,
      };

      let result: Contact | null = null;
      service.createContact(1, contactData).subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.id).toBeDefined();
      expect(result!.fullName).toBe('Jane Doe');
      expect(result!.jobTitle).toBe('CTO');
      expect(result!.email).toBe('jane@example.com');
    }));

    it('should set first contact as primary by default', fakeAsync(() => {
      // Create a new company without contacts
      let company: Company | null = null;
      service.create({ name: 'New Company For Contacts' }).subscribe(res => (company = res));
      tick(300);

      const contactData: CreateContactDto = {
        fullName: 'First Contact',
        jobTitle: 'Manager',
      };

      let result: Contact | null = null;
      service.createContact(company!.id, contactData).subscribe(res => (result = res));
      tick(300);

      expect(result!.isPrimary).toBe(true);
    }));

    it('should demote other contacts when new primary is added', fakeAsync(() => {
      // Company 1 has existing primary contact
      const contactData: CreateContactDto = {
        fullName: 'New Primary',
        jobTitle: 'CEO',
        isPrimary: true,
      };

      service.createContact(1, contactData).subscribe();
      tick(300);

      let company: Company | null = null;
      service.getById(1).subscribe(res => (company = res));
      tick(300);

      const primaryContacts = company!.contacts.filter((c: Contact) => c.isPrimary);
      expect(primaryContacts.length).toBe(1);
      expect(primaryContacts[0].fullName).toBe('New Primary');
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.createContact(99999, { fullName: 'Test', jobTitle: 'Test' });
      }).toThrow();
    }));
  });

  describe('updateContact', () => {
    it('should update a contact', fakeAsync(() => {
      const updateData: UpdateContactDto = {
        fullName: 'Updated Name',
        jobTitle: 'Updated Title',
      };

      let result: Contact | null = null;
      service.updateContact(1, 1, updateData).subscribe(res => (result = res));
      tick(300);

      expect(result!.fullName).toBe('Updated Name');
      expect(result!.jobTitle).toBe('Updated Title');
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.updateContact(99999, 1, { fullName: 'Test' });
      }).toThrow();
    }));

    it('should throw error for non-existent contact', fakeAsync(() => {
      expect(() => {
        service.updateContact(1, 99999, { fullName: 'Test' });
      }).toThrow();
    }));
  });

  describe('deleteContact', () => {
    it('should delete a contact', fakeAsync(() => {
      // First create a contact to delete
      let createdContact: Contact | null = null;
      service
        .createContact(1, { fullName: 'To Delete', jobTitle: 'Temp' })
        .subscribe(res => (createdContact = res));
      tick(300);

      // Delete the contact
      service.deleteContact(1, createdContact!.id).subscribe();
      tick(300);

      // Verify it's deleted
      let company: Company | null = null;
      service.getById(1).subscribe(res => (company = res));
      tick(300);

      expect(company!.contacts.some((c: Contact) => c.id === createdContact!.id)).toBe(false);
    }));

    it('should throw error for non-existent company', fakeAsync(() => {
      expect(() => {
        service.deleteContact(99999, 1);
      }).toThrow();
    }));
  });
});
