/**
 * Company API Service
 *
 * Real API implementation of ICompanyService.
 * Consumes the backend REST API for all company operations.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, buildUrl, ENV } from '../../config/env.config';
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
import { ICompanyService } from '../../interfaces/company-service.interface';
import { PaginatedResponse } from '../../models/pagination.model';
import { Company, CompanyStateChange, Contact, Research } from '../../models/company.model';
import { Vacancy } from '../../models/vacancy.model';

@Injectable()
export class CompanyApiService implements ICompanyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = ENV.apiUrl;

  getAll(params?: CompanyFilterParams): Observable<PaginatedResponse<Company>> {
    const url = `${this.baseUrl}${API_ENDPOINTS.companies.list}`;
    const httpParams = this.buildHttpParams(params);

    return this.http.get<PaginatedResponse<Company>>(url, { params: httpParams });
  }

  getById(id: number): Observable<Company> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.detail, { id })}`;
    return this.http.get<Company>(url);
  }

  create(data: CreateCompanyDto): Observable<Company> {
    const url = `${this.baseUrl}${API_ENDPOINTS.companies.list}`;
    return this.http.post<Company>(url, data);
  }

  update(id: number, data: UpdateCompanyDto): Observable<Company> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.detail, { id })}`;
    return this.http.patch<Company>(url, data);
  }

  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.detail, { id })}`;
    return this.http.delete<void>(url);
  }

  changeState(id: number, data: ChangeCompanyStateDto): Observable<Company> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.state, { id })}`;
    return this.http.patch<Company>(url, data);
  }

  getStateHistory(
    id: number,
    params?: CompanyHistoryFilterParams
  ): Observable<CompanyStateChange[]> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.history, { id })}`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<CompanyStateChange[]>(url, { params: httpParams });
  }

  getVacancies(id: number): Observable<Vacancy[]> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.vacancies, { id })}`;
    return this.http.get<Vacancy[]>(url);
  }

  updateResearch(id: number, data: UpdateResearchDto): Observable<Research> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.research, { id })}`;
    return this.http.patch<Research>(url, data);
  }

  investigate(data: InvestigateCompanyDto): Observable<Company> {
    const url = `${this.baseUrl}${API_ENDPOINTS.companies.investigate}`;
    return this.http.post<Company>(url, data);
  }

  createContact(companyId: number, data: CreateContactDto): Observable<Contact> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.contacts, {
      id: companyId,
    })}`;
    return this.http.post<Contact>(url, data);
  }

  updateContact(companyId: number, contactId: number, data: UpdateContactDto): Observable<Contact> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.contactDetail, {
      companyId,
      contactId,
    })}`;
    return this.http.patch<Contact>(url, data);
  }

  deleteContact(companyId: number, contactId: number): Observable<void> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.companies.contactDetail, {
      companyId,
      contactId,
    })}`;
    return this.http.delete<void>(url);
  }

  /**
   * Builds HttpParams from filter parameters.
   */
  private buildHttpParams(params?: CompanyFilterParams | CompanyHistoryFilterParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    const entries = Object.entries(params) as [string, string | number | undefined][];

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }
}
