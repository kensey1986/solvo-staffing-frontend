/**
 * Vacancy API Service
 *
 * Real API implementation of IVacancyService.
 * Consumes the backend REST API for all vacancy operations.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, buildUrl, ENV } from '../../config/env.config';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../../dtos/vacancy.dto';
import { IVacancyService } from '../../interfaces/vacancy-service.interface';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy, VacancyStateChange } from '../../models/vacancy.model';

@Injectable()
export class VacancyApiService implements IVacancyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = ENV.apiUrl;

  getAll(params?: VacancyFilterParams): Observable<PaginatedResponse<Vacancy>> {
    const url = `${this.baseUrl}${API_ENDPOINTS.vacancies.list}`;
    const httpParams = this.buildHttpParams(params);

    return this.http.get<PaginatedResponse<Vacancy>>(url, { params: httpParams });
  }

  getById(id: number): Observable<Vacancy> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.vacancies.detail, { id })}`;
    return this.http.get<Vacancy>(url);
  }

  create(data: CreateVacancyDto): Observable<Vacancy> {
    const url = `${this.baseUrl}${API_ENDPOINTS.vacancies.list}`;
    return this.http.post<Vacancy>(url, data);
  }

  update(id: number, data: UpdateVacancyDto): Observable<Vacancy> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.vacancies.detail, { id })}`;
    return this.http.patch<Vacancy>(url, data);
  }

  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.vacancies.detail, { id })}`;
    return this.http.delete<void>(url);
  }

  changeState(id: number, data: ChangeVacancyStateDto): Observable<Vacancy> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.vacancies.state, { id })}`;
    return this.http.patch<Vacancy>(url, data);
  }

  getStateHistory(id: number): Observable<VacancyStateChange[]> {
    const url = `${this.baseUrl}${buildUrl(API_ENDPOINTS.vacancies.history, { id })}`;
    return this.http.get<VacancyStateChange[]>(url);
  }

  /**
   * Builds HttpParams from filter parameters.
   */
  private buildHttpParams(params?: VacancyFilterParams): HttpParams {
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
