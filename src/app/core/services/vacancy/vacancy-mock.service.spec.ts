/**
 * Vacancy Mock Service Tests
 *
 * Unit tests for VacancyMockService covering CRUD operations,
 * filtering, pagination, and state history.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VacancyMockService } from './vacancy-mock.service';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../../dtos/vacancy.dto';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy, VacancyStateChange } from '../../models/vacancy.model';

describe('VacancyMockService', () => {
  let service: VacancyMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VacancyMockService],
    });
    service = TestBed.inject(VacancyMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return paginated vacancies', fakeAsync(() => {
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll().subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.data.length).toBeGreaterThan(0);
      expect(result!.page).toBe(1);
      expect(result!.pageSize).toBe(50);
      expect(result!.total).toBeDefined();
    }));

    it('should filter by search term', fakeAsync(() => {
      const params: VacancyFilterParams = { search: 'Engineer' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      expect(result!.data.length).toBeGreaterThan(0);
      result!.data.forEach(v => {
        expect(v.jobTitle.toLowerCase()).toContain('engineer');
      });
    }));

    it('should filter by status', fakeAsync(() => {
      const params: VacancyFilterParams = { status: 'filled' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach(v => expect(v.status).toBe('filled'));
    }));

    it('should filter by pipeline stage', fakeAsync(() => {
      const params: VacancyFilterParams = { pipelineStage: 'contacted' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach(v => expect(v.pipelineStage).toBe('contacted'));
    }));

    it('should filter by source', fakeAsync(() => {
      const params: VacancyFilterParams = { source: 'linkedin' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach(v => expect(v.source).toBe('linkedin'));
    }));

    it('should filter by company name', fakeAsync(() => {
      const params: VacancyFilterParams = { company: 'TechCorp' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach(v => {
        expect(v.companyName.toLowerCase()).toContain('techcorp');
      });
    }));

    it('should filter by state', fakeAsync(() => {
      const params: VacancyFilterParams = { state: 'FL' };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      result!.data.forEach(v => {
        expect(v.location).toContain('FL');
      });
    }));

    it('should paginate results', fakeAsync(() => {
      const params: VacancyFilterParams = { page: 1, pageSize: 5 };
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll(params).subscribe(res => (result = res));
      tick(300);

      expect(result!.page).toBe(1);
      expect(result!.pageSize).toBe(5);
      expect(result!.data.length).toBeLessThanOrEqual(5);
    }));

    it('should sort by published date descending', fakeAsync(() => {
      let result: PaginatedResponse<Vacancy> | null = null;
      service.getAll().subscribe(res => (result = res));
      tick(300);

      const dates = result!.data.map(v => new Date(v.publishedDate).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    }));
  });

  describe('getById', () => {
    it('should return vacancy by id', fakeAsync(() => {
      let result: Vacancy | null = null;
      service.getById(1).subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(1);
    }));

    it('should throw error for non-existent id', fakeAsync(() => {
      expect(() => {
        service.getById(99999);
      }).toThrow();
    }));
  });

  describe('create', () => {
    it('should create a new vacancy', fakeAsync(() => {
      const data: CreateVacancyDto = { jobTitle: 'QA Engineer', companyId: 2 };
      let result: Vacancy | null = null;

      service.create(data).subscribe(res => (result = res));
      tick(300);

      expect(result).toBeTruthy();
      expect(result!.id).toBeDefined();
      expect(result!.jobTitle).toBe('QA Engineer');
      expect(result!.companyId).toBe(2);
      expect(result!.pipelineStage).toBe('detected');
    }));
  });

  describe('update', () => {
    it('should update vacancy', fakeAsync(() => {
      const data: UpdateVacancyDto = { status: 'filled' };
      let result: Vacancy | null = null;

      service.update(1, data).subscribe(res => (result = res));
      tick(300);

      expect(result!.status).toBe('filled');
    }));

    it('should throw error for non-existent id', fakeAsync(() => {
      expect(() => {
        service.update(99999, { status: 'filled' });
      }).toThrow();
    }));
  });

  describe('delete', () => {
    it('should delete vacancy', fakeAsync(() => {
      service.delete(1).subscribe();
      tick(300);

      expect(() => {
        service.getById(1);
      }).toThrow();
    }));
  });

  describe('changeState', () => {
    it('should change vacancy pipeline stage', fakeAsync(() => {
      const data: ChangeVacancyStateDto = { newState: 'proposal', note: 'Test', tags: [] };
      let result: Vacancy | null = null;

      service.changeState(1, data).subscribe(res => (result = res));
      tick(300);

      expect(result!.pipelineStage).toBe('proposal');
    }));

    it('should add history entry', fakeAsync(() => {
      const data: ChangeVacancyStateDto = { newState: 'contacted', note: 'Called', tags: [] };

      service.changeState(1, data).subscribe();
      tick(300);

      let history: VacancyStateChange[] | null = null;
      service.getStateHistory(1).subscribe(res => (history = res));
      tick(300);

      expect(history!.length).toBeGreaterThan(0);
      expect(history![0].toState).toBe('contacted');
    }));

    it('should throw error for non-existent id', fakeAsync(() => {
      expect(() => {
        service.changeState(99999, { newState: 'proposal', note: 'test' });
      }).toThrow();
    }));
  });

  describe('getStateHistory', () => {
    it('should return history for vacancy', fakeAsync(() => {
      let history: VacancyStateChange[] | null = null;
      service.getStateHistory(1).subscribe(res => (history = res));
      tick(300);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    }));

    it('should return empty array for vacancy without history', fakeAsync(() => {
      let history: VacancyStateChange[] | null = null;
      service.getStateHistory(99999).subscribe(res => (history = res));
      tick(300);

      expect(history).toEqual([]);
    }));
  });
});
