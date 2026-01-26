/**
 * Vacancy Mock Service
 *
 * Mock implementation of IVacancyService for development and testing.
 * Simulates API responses with static data and artificial delays.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../../dtos/vacancy.dto';
import { IVacancyService } from '../../interfaces/vacancy-service.interface';
import { PaginatedResponse } from '../../models/pagination.model';
import { Vacancy, VacancyStateChange } from '../../models/vacancy.model';

/** Simulated network delay in milliseconds */
const MOCK_DELAY = 300;

/** Mock vacancy data */
const MOCK_VACANCIES: Vacancy[] = [
  {
    id: 1,
    jobTitle: 'Senior Software Engineer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    department: 'Engineering',
    seniorityLevel: 'senior',
    jobType: 'full_time',
    workModality: 'hybrid',
    isRemoteViable: true,
    salaryRange: '$120,000 - $160,000',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-12-13',
    notes: 'Ideal candidate with React and Node.js experience.',
  },
  {
    id: 2,
    jobTitle: 'Product Manager',
    companyId: 6,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    department: 'Product',
    seniorityLevel: 'senior',
    jobType: 'full_time',
    workModality: 'remote',
    isRemoteViable: true,
    salaryRange: '$140,000 - $180,000',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-12-12',
  },
  {
    id: 3,
    jobTitle: 'Registered Nurse - ICU',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    department: 'Nursing',
    seniorityLevel: 'mid_level',
    jobType: 'full_time',
    workModality: 'on_site',
    isRemoteViable: false,
    salaryRange: '$75,000 - $95,000',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-11',
  },
  {
    id: 4,
    jobTitle: 'Financial Analyst',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    department: 'Finance',
    seniorityLevel: 'mid_level',
    jobType: 'full_time',
    workModality: 'hybrid',
    isRemoteViable: true,
    salaryRange: '$90,000 - $120,000',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-12-05',
  },
  {
    id: 5,
    jobTitle: 'Store Manager',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    department: 'Operations',
    seniorityLevel: 'mid_senior',
    jobType: 'full_time',
    workModality: 'on_site',
    isRemoteViable: false,
    salaryRange: '$65,000 - $85,000',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-12-10',
  },
  {
    id: 6,
    jobTitle: 'DevOps Engineer',
    companyId: 6,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    department: 'Infrastructure',
    seniorityLevel: 'senior',
    jobType: 'full_time',
    workModality: 'remote',
    isRemoteViable: true,
    salaryRange: '$130,000 - $170,000',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-12-14',
  },
  {
    id: 7,
    jobTitle: 'Warehouse Supervisor',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    department: 'Warehouse',
    seniorityLevel: 'mid_level',
    jobType: 'full_time',
    workModality: 'on_site',
    isRemoteViable: false,
    salaryRange: '$55,000 - $70,000',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'indeed',
    publishedDate: '2025-11-20',
  },
  {
    id: 8,
    jobTitle: 'Marketing Coordinator',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    department: 'Marketing',
    seniorityLevel: 'entry_level',
    jobType: 'full_time',
    workModality: 'hybrid',
    isRemoteViable: true,
    salaryRange: '$50,000 - $65,000',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-09',
  },
  {
    id: 9,
    jobTitle: 'Solar Installation Technician',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    department: 'Installation',
    seniorityLevel: 'mid_level',
    jobType: 'full_time',
    workModality: 'on_site',
    isRemoteViable: false,
    salaryRange: '$45,000 - $60,000',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-12-08',
  },
  {
    id: 10,
    jobTitle: 'Project Manager - Construction',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    department: 'Project Management',
    seniorityLevel: 'senior',
    jobType: 'full_time',
    workModality: 'on_site',
    isRemoteViable: false,
    salaryRange: '$95,000 - $125,000',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-12-07',
  },
  {
    id: 11,
    jobTitle: 'Data Scientist',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    department: 'Data Science',
    seniorityLevel: 'senior',
    jobType: 'full_time',
    workModality: 'hybrid',
    isRemoteViable: true,
    salaryRange: '$130,000 - $165,000',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-12-14',
  },
  {
    id: 12,
    jobTitle: 'HR Generalist',
    companyId: 2,
    companyName: 'Global Manufacturing Inc',
    location: 'Houston, TX',
    department: 'Human Resources',
    seniorityLevel: 'mid_level',
    jobType: 'full_time',
    workModality: 'hybrid',
    isRemoteViable: true,
    salaryRange: '$60,000 - $80,000',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-06',
  },
];

/** Mock state change history */
const MOCK_STATE_HISTORY: Record<number, VacancyStateChange[]> = {
  1: [
    {
      date: '2025-12-14T10:30:00Z',
      user: 'Carlos Mendoza',
      fromState: 'detected',
      toState: 'contacted',
      note: 'First contact sent to HR Director. Awaiting response.',
      tags: ['#email', '#outreach'],
    },
    {
      date: '2025-12-13T14:30:00Z',
      user: 'System',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected automatically from Indeed.',
      tags: ['#auto'],
    },
  ],
};

@Injectable()
export class VacancyMockService implements IVacancyService {
  private vacancies = [...MOCK_VACANCIES];
  private nextId = Math.max(...this.vacancies.map(v => v.id)) + 1;
  private stateHistory = { ...MOCK_STATE_HISTORY };

  getAll(params?: VacancyFilterParams): Observable<PaginatedResponse<Vacancy>> {
    let filtered = [...this.vacancies];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(v => v.jobTitle.toLowerCase().includes(search));
    }

    if (params?.status) {
      filtered = filtered.filter(v => v.status === params.status);
    }

    if (params?.pipelineStage) {
      filtered = filtered.filter(v => v.pipelineStage === params.pipelineStage);
    }

    if (params?.source) {
      filtered = filtered.filter(v => v.source === params.source);
    }

    if (params?.company) {
      const company = params.company.toLowerCase();
      filtered = filtered.filter(v => v.companyName.toLowerCase().includes(company));
    }

    if (params?.state) {
      filtered = filtered.filter(v => v.location.includes(params.state!));
    }

    // Sort by published date descending
    filtered.sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return of({
      data: paginatedData,
      total: 148523, // Mock total count
      page,
      pageSize,
      totalPages: Math.ceil(148523 / pageSize),
    }).pipe(delay(MOCK_DELAY));
  }

  getById(id: number): Observable<Vacancy> {
    const vacancy = this.vacancies.find(v => v.id === id);
    if (!vacancy) {
      throw new Error(`Vacancy with id ${id} not found`);
    }
    return of(vacancy).pipe(delay(MOCK_DELAY));
  }

  create(data: CreateVacancyDto): Observable<Vacancy> {
    const newVacancy: Vacancy = {
      id: this.nextId++,
      jobTitle: data.jobTitle,
      companyId: data.companyId,
      companyName: 'New Company',
      location: data.location || 'Unknown',
      department: data.department,
      seniorityLevel: data.seniorityLevel,
      salaryRange: data.salaryRange,
      status: 'active',
      pipelineStage: 'detected',
      source: 'manual',
      publishedDate: new Date().toISOString().split('T')[0],
    };

    this.vacancies.unshift(newVacancy);
    return of(newVacancy).pipe(delay(MOCK_DELAY));
  }

  update(id: number, data: UpdateVacancyDto): Observable<Vacancy> {
    const index = this.vacancies.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Vacancy with id ${id} not found`);
    }

    this.vacancies[index] = { ...this.vacancies[index], ...data };
    return of(this.vacancies[index]).pipe(delay(MOCK_DELAY));
  }

  delete(id: number): Observable<void> {
    const index = this.vacancies.findIndex(v => v.id === id);
    if (index !== -1) {
      this.vacancies.splice(index, 1);
    }
    return of(undefined).pipe(delay(MOCK_DELAY));
  }

  changeState(id: number, data: ChangeVacancyStateDto): Observable<Vacancy> {
    const vacancy = this.vacancies.find(v => v.id === id);
    if (!vacancy) {
      throw new Error(`Vacancy with id ${id} not found`);
    }

    const previousState = vacancy.pipelineStage;
    vacancy.pipelineStage = data.newState;

    // Add to history
    const historyEntry: VacancyStateChange = {
      date: new Date().toISOString(),
      user: 'Carlos Mendoza',
      fromState: previousState,
      toState: data.newState,
      note: data.note,
      tags: data.tags || [],
    };

    if (!this.stateHistory[id]) {
      this.stateHistory[id] = [];
    }
    this.stateHistory[id].unshift(historyEntry);

    return of(vacancy).pipe(delay(MOCK_DELAY));
  }

  getStateHistory(id: number): Observable<VacancyStateChange[]> {
    const history = this.stateHistory[id] || [];
    return of(history).pipe(delay(MOCK_DELAY));
  }
}
