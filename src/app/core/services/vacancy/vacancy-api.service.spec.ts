/**
 * Vacancy API Service Tests
 *
 * Unit tests for VacancyApiService HTTP interactions.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { VacancyApiService } from './vacancy-api.service';
import { API_ENDPOINTS, ENV } from '../../config/env.config';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../../dtos/vacancy.dto';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy, VacancyStateChange } from '../../models/vacancy.model';

describe('VacancyApiService', () => {
  let service: VacancyApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/api';
  const apiVersion = 'v1';
  const apiUrl = `${baseUrl}/${apiVersion}`;

  beforeEach(() => {
    ENV.apiBaseUrl = baseUrl;
    ENV.apiVersion = apiVersion;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VacancyApiService],
    });

    service = TestBed.inject(VacancyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all vacancies with filters', () => {
    const params: VacancyFilterParams = {
      search: 'Engineer',
      page: 2,
      pageSize: 10,
      pipelineStage: 'detected',
      status: 'active',
    };

    const mockResponse: PaginatedResponse<Vacancy> = {
      data: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 0,
    };

    service.getAll(params).subscribe(res => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      request =>
        request.url === `${apiUrl}${API_ENDPOINTS.vacancies.list}` &&
        request.params.get('search') === 'Engineer' &&
        request.params.get('page') === '2' &&
        request.params.get('pageSize') === '10' &&
        request.params.get('pipelineStage') === 'detected' &&
        request.params.get('status') === 'active'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get vacancy by id', () => {
    const mockVacancy = {
      id: 1,
      jobTitle: 'Software Engineer',
      companyId: 10,
      companyName: 'Acme',
      location: 'Remote',
      status: 'active',
      pipelineStage: 'detected',
      source: 'linkedin',
      publishedDate: '2025-01-01',
    } as Vacancy;

    service.getById(1).subscribe(res => expect(res).toEqual(mockVacancy));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.vacancies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockVacancy);
  });

  it('should create vacancy', () => {
    const payload: CreateVacancyDto = { jobTitle: 'New Role', companyId: 10 };
    const mockVacancy = {
      id: 2,
      jobTitle: 'New Role',
      companyId: 10,
      companyName: 'Acme',
      location: 'Remote',
      status: 'active',
      pipelineStage: 'detected',
      source: 'linkedin',
      publishedDate: '2025-01-01',
    } as Vacancy;

    service.create(payload).subscribe(res => expect(res).toEqual(mockVacancy));

    const req = httpMock.expectOne(`${apiUrl}${API_ENDPOINTS.vacancies.list}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockVacancy);
  });

  it('should update vacancy', () => {
    const payload: UpdateVacancyDto = { status: 'filled' };
    const mockVacancy = {
      id: 1,
      jobTitle: 'Software Engineer',
      companyId: 10,
      companyName: 'Acme',
      location: 'Remote',
      status: 'filled',
      pipelineStage: 'detected',
      source: 'linkedin',
      publishedDate: '2025-01-01',
    } as Vacancy;

    service.update(1, payload).subscribe(res => expect(res).toEqual(mockVacancy));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.vacancies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockVacancy);
  });

  it('should delete vacancy', () => {
    service.delete(1).subscribe(res => expect(res).toBeUndefined());

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.vacancies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should change vacancy state', () => {
    const payload: ChangeVacancyStateDto = { newState: 'proposal', note: 'Test', tags: [] };
    const mockVacancy = {
      id: 1,
      jobTitle: 'Software Engineer',
      companyId: 10,
      companyName: 'Acme',
      location: 'Remote',
      status: 'active',
      pipelineStage: 'proposal',
      source: 'linkedin',
      publishedDate: '2025-01-01',
    } as Vacancy;

    service.changeState(1, payload).subscribe(res => expect(res).toEqual(mockVacancy));

    const req = httpMock.expectOne(`${apiUrl}${API_ENDPOINTS.vacancies.state.replace(':id', '1')}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockVacancy);
  });

  it('should get vacancy state history', () => {
    const mockHistory: VacancyStateChange[] = [];

    service.getStateHistory(1).subscribe(res => expect(res).toEqual(mockHistory));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.vacancies.history.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});
