/**
 * Company API Service Tests
 *
 * Unit tests for CompanyApiService HTTP interactions.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CompanyApiService } from './company-api.service';
import { API_ENDPOINTS, ENV } from '../../config/env.config';
import {
  ChangeCompanyStateDto,
  CompanyFilterParams,
  CompanyHistoryFilterParams,
  CreateCompanyDto,
  CreateContactDto,
  InvestigateCompanyDto,
  UpdateCompanyDto,
  UpdateContactDto,
  UpdateResearchDto,
} from '../../dtos/company.dto';
import { Company, CompanyStateChange, Contact, Research } from '../../models/company.model';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy } from '../../models/vacancy.model';

describe('CompanyApiService', () => {
  let service: CompanyApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/api';
  const apiVersion = 'v1';
  const apiUrl = `${baseUrl}/${apiVersion}`;

  beforeEach(() => {
    ENV.apiBaseUrl = baseUrl;
    ENV.apiVersion = apiVersion;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompanyApiService],
    });

    service = TestBed.inject(CompanyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all companies with filters', () => {
    const params: CompanyFilterParams = {
      search: 'Acme',
      page: 2,
      pageSize: 10,
      pipelineStage: 'lead',
    };

    const mockResponse: PaginatedResponse<Company> = {
      data: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 0,
    };

    service.getAll(params).subscribe(res => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(
      request =>
        request.url === `${apiUrl}${API_ENDPOINTS.companies.list}` &&
        request.params.get('search') === 'Acme' &&
        request.params.get('page') === '2' &&
        request.params.get('pageSize') === '10' &&
        request.params.get('pipelineStage') === 'lead'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get company by id', () => {
    const mockCompany = {
      id: 1,
      name: 'Test',
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
    } as Company;

    service.getById(1).subscribe(res => expect(res).toEqual(mockCompany));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCompany);
  });

  it('should create company', () => {
    const payload: CreateCompanyDto = { name: 'New Company' };
    const mockCompany = {
      id: 1,
      name: 'New Company',
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
    } as Company;

    service.create(payload).subscribe(res => expect(res).toEqual(mockCompany));

    const req = httpMock.expectOne(`${apiUrl}${API_ENDPOINTS.companies.list}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCompany);
  });

  it('should update company', () => {
    const payload: UpdateCompanyDto = { name: 'Updated' };
    const mockCompany = {
      id: 1,
      name: 'Updated',
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
    } as Company;

    service.update(1, payload).subscribe(res => expect(res).toEqual(mockCompany));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCompany);
  });

  it('should delete company', () => {
    service.delete(1).subscribe(res => expect(res).toBeUndefined());

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.detail.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should change company state', () => {
    const payload: ChangeCompanyStateDto = { newState: 'prospecting', note: 'Test', tags: [] };
    const mockCompany = {
      id: 1,
      name: 'Test',
      relationshipType: 'lead',
      pipelineStage: 'prospecting',
      contacts: [],
    } as Company;

    service.changeState(1, payload).subscribe(res => expect(res).toEqual(mockCompany));

    const req = httpMock.expectOne(`${apiUrl}${API_ENDPOINTS.companies.state.replace(':id', '1')}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCompany);
  });

  it('should get state history with filters', () => {
    const params: CompanyHistoryFilterParams = { stage: 'lead', user: 'Admin' };
    const mockHistory: CompanyStateChange[] = [];

    service.getStateHistory(1, params).subscribe(res => expect(res).toEqual(mockHistory));

    const req = httpMock.expectOne(
      request =>
        request.url === `${apiUrl}${API_ENDPOINTS.companies.history.replace(':id', '1')}` &&
        request.params.get('stage') === 'lead' &&
        request.params.get('user') === 'Admin'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  it('should get vacancies for a company', () => {
    const mockVacancies: Vacancy[] = [];

    service.getVacancies(1).subscribe(res => expect(res).toEqual(mockVacancies));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.vacancies.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockVacancies);
  });

  it('should update research', () => {
    const payload: UpdateResearchDto = { mission: 'Updated mission' };
    const mockResearch: Research = { completenessPercent: 50, mission: 'Updated mission' };

    service.updateResearch(1, payload).subscribe(res => expect(res).toEqual(mockResearch));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.research.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResearch);
  });

  it('should investigate company', () => {
    const payload: InvestigateCompanyDto = { name: 'New Co', country: 'USA' };
    const mockCompany = {
      id: 1,
      name: 'New Co',
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
    } as Company;

    service.investigate(payload).subscribe(res => expect(res).toEqual(mockCompany));

    const req = httpMock.expectOne(`${apiUrl}${API_ENDPOINTS.companies.investigate}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCompany);
  });

  it('should create contact', () => {
    const payload: CreateContactDto = { fullName: 'Jane Doe', jobTitle: 'CTO' };
    const mockContact: Contact = { id: 1, fullName: 'Jane Doe', jobTitle: 'CTO', isPrimary: false };

    service.createContact(1, payload).subscribe(res => expect(res).toEqual(mockContact));

    const req = httpMock.expectOne(
      `${apiUrl}${API_ENDPOINTS.companies.contacts.replace(':id', '1')}`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockContact);
  });

  it('should update contact', () => {
    const payload: UpdateContactDto = { fullName: 'Updated' };
    const mockContact: Contact = { id: 1, fullName: 'Updated', jobTitle: 'CTO', isPrimary: false };

    service.updateContact(1, 10, payload).subscribe(res => expect(res).toEqual(mockContact));

    const url = `${apiUrl}${API_ENDPOINTS.companies.contactDetail
      .replace(':companyId', '1')
      .replace(':contactId', '10')}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush(mockContact);
  });

  it('should delete contact', () => {
    service.deleteContact(1, 10).subscribe(res => expect(res).toBeUndefined());

    const url = `${apiUrl}${API_ENDPOINTS.companies.contactDetail
      .replace(':companyId', '1')
      .replace(':contactId', '10')}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
