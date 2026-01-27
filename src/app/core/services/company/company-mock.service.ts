/**
 * Company Mock Service
 *
 * Mock implementation of ICompanyService for development and testing.
 * Simulates API responses with static data and artificial delays.
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
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
import {
  JobType,
  SeniorityLevel,
  Vacancy,
  VacancySource,
  WorkModality,
} from '../../models/vacancy.model';

/** Simulated network delay in milliseconds */
const MOCK_DELAY = 300;

const COMPANY_NAME_TO_ID: Record<string, number> = {
  'TechCorp Solutions': 1,
  'Global Manufacturing Inc': 2,
  'HealthFirst Medical': 3,
  'Financial Partners LLC': 4,
  'Retail Masters Group': 5,
  'CloudScale Technologies': 6,
  'Logistics Pro': 7,
  'EduTech Learning': 8,
  'Green Energy Corp': 9,
  'Construction Plus': 10,
  'SalesForce Pro': 13,
  'SecureNet Systems': 14,
  'Industrial Dynamics': 15,
  'AppVenture Studios': 16,
};

const SOURCE_DOMAIN: Record<VacancySource, string> = {
  indeed: 'https://www.indeed.com/viewjob?jk=',
  linkedin: 'https://www.linkedin.com/jobs/view/',
  company_website: 'https://careers.',
  manual: 'https://solvo.local/mock/',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function inferDepartment(title: string): string {
  const normalized = title.toLowerCase();
  if (/(nurse|medical|clinical|health|pharmacist|therapist)/.test(normalized)) return 'Healthcare';
  if (/(engineer|developer|software|devops|data|security|qa|sre|it|network)/.test(normalized))
    return 'Engineering';
  if (/(product|ux|ui|designer|design|scrum)/.test(normalized)) return 'Product';
  if (/(sales|account|business development|sdr)/.test(normalized)) return 'Sales';
  if (/(marketing|content|brand|growth)/.test(normalized)) return 'Marketing';
  if (/(finance|financial|analyst|banker|accountant|risk|tax)/.test(normalized)) return 'Finance';
  if (/(hr|human|talent|recruit|people)/.test(normalized)) return 'Human Resources';
  if (/(operations|manager|supervisor|coordinator|director|lead)/.test(normalized))
    return 'Operations';
  return 'General';
}

function inferSeniority(title: string): SeniorityLevel {
  const normalized = title.toLowerCase();
  if (/(intern|trainee|entry)/.test(normalized)) return 'entry_level';
  if (/(junior)/.test(normalized)) return 'entry_level';
  if (/(mid|associate)/.test(normalized)) return 'mid_level';
  if (/(senior)/.test(normalized)) return 'senior';
  if (/(lead|principal)/.test(normalized)) return 'lead';
  if (/(manager)/.test(normalized)) return 'manager';
  if (/(director|vp|vice president)/.test(normalized)) return 'director';
  return 'mid_level';
}

function inferJobType(title: string): JobType {
  const normalized = title.toLowerCase();
  if (/(intern)/.test(normalized)) return 'internship';
  if (/(contract|freelance)/.test(normalized)) return 'contract';
  if (/(part[-\s]?time)/.test(normalized)) return 'part_time';
  return 'full_time';
}

function inferWorkModality(title: string, location: string): WorkModality {
  const normalized = `${title} ${location}`.toLowerCase();
  if (/remote|remoto/.test(normalized)) return 'remote';
  if (/hybrid|hibrid/.test(normalized)) return 'hybrid';
  return 'on_site';
}

function inferSalaryRange(department: string, seniority: SeniorityLevel): string {
  const baseRanges: Record<string, Record<SeniorityLevel, string>> = {
    Engineering: {
      entry_level: '$60,000 - $80,000',
      mid_level: '$85,000 - $115,000',
      mid_senior: '$100,000 - $130,000',
      senior: '$120,000 - $160,000',
      lead: '$140,000 - $180,000',
      manager: '$150,000 - $190,000',
      director: '$170,000 - $210,000',
      executive: '$190,000 - $240,000',
    },
    Product: {
      entry_level: '$55,000 - $75,000',
      mid_level: '$80,000 - $110,000',
      mid_senior: '$95,000 - $125,000',
      senior: '$115,000 - $150,000',
      lead: '$130,000 - $170,000',
      manager: '$140,000 - $180,000',
      director: '$160,000 - $200,000',
      executive: '$180,000 - $220,000',
    },
    Finance: {
      entry_level: '$50,000 - $70,000',
      mid_level: '$70,000 - $95,000',
      mid_senior: '$85,000 - $110,000',
      senior: '$100,000 - $140,000',
      lead: '$120,000 - $160,000',
      manager: '$130,000 - $170,000',
      director: '$150,000 - $190,000',
      executive: '$170,000 - $210,000',
    },
    Sales: {
      entry_level: '$45,000 - $65,000',
      mid_level: '$60,000 - $90,000',
      mid_senior: '$75,000 - $105,000',
      senior: '$90,000 - $130,000',
      lead: '$100,000 - $140,000',
      manager: '$110,000 - $150,000',
      director: '$130,000 - $170,000',
      executive: '$150,000 - $190,000',
    },
    Healthcare: {
      entry_level: '$45,000 - $65,000',
      mid_level: '$60,000 - $85,000',
      mid_senior: '$70,000 - $95,000',
      senior: '$80,000 - $110,000',
      lead: '$95,000 - $125,000',
      manager: '$100,000 - $130,000',
      director: '$120,000 - $150,000',
      executive: '$130,000 - $170,000',
    },
    Marketing: {
      entry_level: '$40,000 - $60,000',
      mid_level: '$55,000 - $80,000',
      mid_senior: '$65,000 - $90,000',
      senior: '$80,000 - $110,000',
      lead: '$95,000 - $125,000',
      manager: '$105,000 - $135,000',
      director: '$120,000 - $150,000',
      executive: '$140,000 - $170,000',
    },
    Operations: {
      entry_level: '$40,000 - $60,000',
      mid_level: '$55,000 - $80,000',
      mid_senior: '$65,000 - $90,000',
      senior: '$80,000 - $110,000',
      lead: '$95,000 - $125,000',
      manager: '$105,000 - $135,000',
      director: '$120,000 - $150,000',
      executive: '$140,000 - $170,000',
    },
    General: {
      entry_level: '$38,000 - $55,000',
      mid_level: '$50,000 - $70,000',
      mid_senior: '$60,000 - $80,000',
      senior: '$70,000 - $95,000',
      lead: '$80,000 - $105,000',
      manager: '$90,000 - $115,000',
      director: '$105,000 - $135,000',
      executive: '$120,000 - $150,000',
    },
  };

  return baseRanges[department]?.[seniority] || baseRanges['General'].mid_level;
}

function buildDescription(title: string, companyName: string, department: string): string {
  const summary =
    department === 'Engineering'
      ? 'building scalable systems and modern web services'
      : 'delivering outstanding results in a fast-paced environment';
  return `We are hiring a ${title} to join ${companyName}. The ideal candidate will be focused on ${summary}.\n\n<strong>Responsibilities:</strong>\n• Own key deliverables and collaborate across teams\n• Maintain high standards for quality and execution\n\n<strong>Requirements:</strong>\n• Relevant experience for the role\n• Strong communication and problem-solving skills`;
}

function buildNotes(stage: string): string {
  switch (stage) {
    case 'detected':
      return 'Pendiente de contacto inicial y validación con el cliente.';
    case 'contacted':
      return 'Contacto inicial enviado. En espera de respuesta.';
    case 'proposal':
      return 'Propuesta comercial en revisión por parte del cliente.';
    case 'won':
      return 'Vacante cerrada exitosamente. Preparar onboarding.';
    case 'lost':
      return 'Vacante perdida. Registrar motivo en seguimiento.';
    default:
      return 'Seguimiento en curso.';
  }
}

function hydrateVacancy(vacancy: Vacancy): Vacancy {
  const resolvedCompanyId = COMPANY_NAME_TO_ID[vacancy.companyName] || vacancy.companyId;
  const department = vacancy.department || inferDepartment(vacancy.jobTitle);
  const seniorityLevel = vacancy.seniorityLevel || inferSeniority(vacancy.jobTitle);
  const jobType = vacancy.jobType || inferJobType(vacancy.jobTitle);
  const workModality = vacancy.workModality || inferWorkModality(vacancy.jobTitle, vacancy.location);
  const isRemoteViable = vacancy.isRemoteViable ?? workModality !== 'on_site';
  const salaryRange = vacancy.salaryRange || inferSalaryRange(department, seniorityLevel);
  const scrapedAt =
    vacancy.scrapedAt || `${vacancy.publishedDate}T14:30:00Z`;
  const jobUrl =
    vacancy.jobUrl ||
    (vacancy.source === 'company_website'
      ? `${SOURCE_DOMAIN.company_website}${slugify(vacancy.companyName)}.com/jobs/${slugify(
          vacancy.jobTitle
        )}`
      : `${SOURCE_DOMAIN[vacancy.source]}${slugify(vacancy.jobTitle)}-${resolvedCompanyId}`);
  const description =
    vacancy.description || buildDescription(vacancy.jobTitle, vacancy.companyName, department);
  const notes = vacancy.notes || buildNotes(vacancy.pipelineStage);

  return {
    ...vacancy,
    companyId: resolvedCompanyId,
    department,
    seniorityLevel,
    jobType,
    workModality,
    isRemoteViable,
    salaryRange,
    jobUrl,
    scrapedAt,
    description,
    notes,
  };
}

/** Mock company data - IDs match companyId in MOCK_VACANCIES */
export const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    industry: 'technology',
    location: 'Miami, FL',
    relationshipType: 'client',
    pipelineStage: 'onboarding_started',
    website: 'https://techcorp.com',
    phone: '+1 (305) 555-0123',
    employees: '500-1000',
    country: 'USA',
    contacts: [
      {
        id: 1,
        fullName: 'John Smith',
        jobTitle: 'HR Director',
        email: 'john.smith@techcorp.com',
        phone: '+1 (305) 555-0124',
        linkedinUrl: 'linkedin.com/in/johnsmith',
        isPrimary: true,
      },
      {
        id: 2,
        fullName: 'Sarah Johnson',
        jobTitle: 'Talent Acquisition Manager',
        email: 'sarah.j@techcorp.com',
        phone: '+1 (305) 555-0125',
        linkedinUrl: 'linkedin.com/in/sarahjohnson',
        isPrimary: false,
      },
    ],
    research: {
      valueProposition:
        'Soluciones tecnológicas innovadoras que transforman la manera en que las empresas operan, aumentando la eficiencia operativa en un 40% promedio.',
      mission:
        'Empoderar a las organizaciones con tecnología de vanguardia para impulsar su transformación digital.',
      vision: 'Ser el líder global en soluciones tecnológicas empresariales para 2030.',
      salesPitch:
        'TechCorp ofrece soluciones personalizadas con ROI demostrable en 6 meses. Su equipo de 500+ ingenieros garantiza soporte 24/7 y actualizaciones continuas.',
      lastResearchDate: '2025-12-15',
      completenessPercent: 85,
    },
    createdAt: '2025-06-15',
    updatedAt: '2025-12-15',
    assignedTo: 'Carlos M.',
    researchStatus: 'completed',
  },
  {
    id: 2,
    name: 'Global Manufacturing Inc',
    industry: 'manufacturing',
    location: 'Houston, TX',
    relationshipType: 'prospect',
    pipelineStage: 'prospecting',
    website: 'https://globalmanufacturing.com',
    phone: '+1 (713) 555-0100',
    employees: '1000-5000',
    country: 'USA',
    contacts: [
      {
        id: 3,
        fullName: 'Michael Brown',
        jobTitle: 'VP of Operations',
        email: 'm.brown@globalmanufacturing.com',
        phone: '+1 (713) 555-0101',
        isPrimary: true,
      },
    ],
    research: {
      completenessPercent: 30,
    },
    createdAt: '2025-09-10',
    updatedAt: '2025-12-10',
    assignedTo: 'María G.',
    researchStatus: 'pending',
  },
  {
    id: 3,
    name: 'HealthFirst Medical',
    industry: 'healthcare',
    location: 'Atlanta, GA',
    relationshipType: 'lead',
    pipelineStage: 'lead',
    website: 'https://healthfirstmedical.com',
    phone: '+1 (404) 555-0200',
    employees: '200-500',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 0,
    },
    createdAt: '2025-11-20',
    updatedAt: '2025-11-20',
    assignedTo: undefined,
    researchStatus: undefined,
  },
  {
    id: 4,
    name: 'Financial Partners LLC',
    industry: 'financial_services',
    location: 'New York, NY',
    relationshipType: 'client',
    pipelineStage: 'onboarding_started',
    website: 'https://financialpartners.com',
    phone: '+1 (212) 555-0300',
    employees: '100-200',
    country: 'USA',
    contacts: [
      {
        id: 4,
        fullName: 'Emily Davis',
        jobTitle: 'Chief People Officer',
        email: 'e.davis@financialpartners.com',
        phone: '+1 (212) 555-0301',
        linkedinUrl: 'linkedin.com/in/emilydavis',
        isPrimary: true,
      },
    ],
    research: {
      valueProposition: 'Servicios financieros personalizados para empresas medianas.',
      mission: 'Democratizar el acceso a servicios financieros de alta calidad.',
      completenessPercent: 60,
    },
    createdAt: '2025-03-05',
    updatedAt: '2025-12-01',
    assignedTo: 'Carlos M.',
    researchStatus: 'completed',
  },
  {
    id: 5,
    name: 'Retail Masters Group',
    industry: 'retail',
    location: 'Chicago, IL',
    relationshipType: 'prospect',
    pipelineStage: 'engaged',
    website: 'https://retailmasters.com',
    phone: '+1 (312) 555-0400',
    employees: '5000+',
    country: 'USA',
    contacts: [
      {
        id: 5,
        fullName: 'Robert Wilson',
        jobTitle: 'HR Manager',
        email: 'r.wilson@retailmasters.com',
        isPrimary: true,
      },
    ],
    research: {
      completenessPercent: 45,
    },
    createdAt: '2025-08-12',
    updatedAt: '2025-12-08',
    assignedTo: 'Juan P.',
    researchStatus: 'pending',
  },
  {
    id: 6,
    name: 'CloudScale Technologies',
    industry: 'technology',
    location: 'San Francisco, CA',
    relationshipType: 'prospect',
    pipelineStage: 'initial_appointment_held',
    website: 'https://cloudscale.io',
    phone: '+1 (415) 555-0500',
    employees: '200-500',
    country: 'USA',
    contacts: [
      {
        id: 6,
        fullName: 'Amanda Chen',
        jobTitle: 'Head of Talent',
        email: 'a.chen@cloudscale.io',
        phone: '+1 (415) 555-0501',
        linkedinUrl: 'linkedin.com/in/amandachen',
        isPrimary: true,
      },
    ],
    research: {
      valueProposition:
        'Plataforma de infraestructura cloud que escala automáticamente según demanda.',
      vision: 'Liderar la revolución de la infraestructura serverless.',
      salesPitch:
        'CloudScale reduce costos de infraestructura en 60% con su modelo de pago por uso.',
      completenessPercent: 70,
    },
    createdAt: '2025-07-20',
    updatedAt: '2025-12-12',
    assignedTo: 'Carlos M.',
    researchStatus: 'completed',
  },
  {
    id: 7,
    name: 'Logistics Pro',
    industry: 'logistics',
    location: 'Dallas, TX',
    relationshipType: 'lead',
    pipelineStage: 'lead',
    website: 'https://logisticspro.com',
    employees: '500-1000',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 10,
    },
    createdAt: '2025-12-01',
    updatedAt: '2025-12-01',
    assignedTo: undefined,
    researchStatus: undefined,
  },
  {
    id: 8,
    name: 'EduTech Learning',
    industry: 'education',
    location: 'Boston, MA',
    relationshipType: 'inactive',
    pipelineStage: 'lost',
    website: 'https://edutechlearning.com',
    phone: '+1 (617) 555-0700',
    employees: '50-100',
    country: 'USA',
    contacts: [
      {
        id: 7,
        fullName: 'Jennifer Lee',
        jobTitle: 'CEO',
        email: 'j.lee@edutechlearning.com',
        isPrimary: true,
      },
    ],
    research: {
      completenessPercent: 55,
    },
    createdAt: '2025-02-10',
    updatedAt: '2025-10-15',
    assignedTo: 'María G.',
    researchStatus: 'completed',
  },
  {
    id: 9,
    name: 'Green Energy Corp',
    industry: 'energy',
    location: 'Denver, CO',
    relationshipType: 'prospect',
    pipelineStage: 'prospecting',
    website: 'https://greenenergycorp.com',
    phone: '+1 (303) 555-0800',
    employees: '200-500',
    country: 'USA',
    contacts: [
      {
        id: 8,
        fullName: 'David Martinez',
        jobTitle: 'HR Director',
        email: 'd.martinez@greenenergycorp.com',
        isPrimary: true,
      },
    ],
    research: {
      mission: 'Acelerar la transición hacia energías renovables.',
      completenessPercent: 25,
    },
    createdAt: '2025-09-25',
    updatedAt: '2025-12-05',
    assignedTo: undefined,
    researchStatus: undefined,
  },
  {
    id: 10,
    name: 'Construction Plus',
    industry: 'construction',
    location: 'Phoenix, AZ',
    relationshipType: 'client',
    pipelineStage: 'onboarding_started',
    website: 'https://constructionplus.com',
    phone: '+1 (602) 555-0900',
    employees: '1000-5000',
    country: 'USA',
    contacts: [
      {
        id: 9,
        fullName: 'Patricia Garcia',
        jobTitle: 'Talent Director',
        email: 'p.garcia@constructionplus.com',
        phone: '+1 (602) 555-0901',
        isPrimary: true,
      },
    ],
    research: {
      valueProposition: 'Construcción comercial de alta calidad con plazos garantizados.',
      salesPitch:
        'Construction Plus tiene 98% de proyectos entregados a tiempo en los últimos 5 años.',
      completenessPercent: 50,
    },
    createdAt: '2025-04-18',
    updatedAt: '2025-11-30',
    assignedTo: 'Juan P.',
    researchStatus: 'pending',
  },
  {
    id: 13,
    name: 'SalesForce Pro',
    industry: 'technology',
    location: 'Austin, TX',
    relationshipType: 'prospect',
    pipelineStage: 'prospecting',
    website: 'https://salesforcepro.com',
    phone: '+1 (512) 555-1100',
    employees: '200-500',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 25,
    },
    createdAt: '2025-09-05',
    updatedAt: '2025-12-10',
    assignedTo: 'Carlos M.',
    researchStatus: 'pending',
  },
  {
    id: 14,
    name: 'SecureNet Systems',
    industry: 'technology',
    location: 'Seattle, WA',
    relationshipType: 'lead',
    pipelineStage: 'lead',
    website: 'https://securenetsystems.com',
    phone: '+1 (206) 555-1200',
    employees: '100-200',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 15,
    },
    createdAt: '2025-10-01',
    updatedAt: '2025-12-01',
    assignedTo: undefined,
    researchStatus: 'pending',
  },
  {
    id: 15,
    name: 'Industrial Dynamics',
    industry: 'manufacturing',
    location: 'Detroit, MI',
    relationshipType: 'prospect',
    pipelineStage: 'prospecting',
    website: 'https://industrialdynamics.com',
    phone: '+1 (313) 555-1300',
    employees: '500-1000',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 35,
    },
    createdAt: '2025-07-12',
    updatedAt: '2025-12-03',
    assignedTo: 'Juan P.',
    researchStatus: 'pending',
  },
  {
    id: 16,
    name: 'AppVenture Studios',
    industry: 'technology',
    location: 'Los Angeles, CA',
    relationshipType: 'lead',
    pipelineStage: 'lead',
    website: 'https://appventurestudios.com',
    phone: '+1 (213) 555-1400',
    employees: '50-100',
    country: 'USA',
    contacts: [],
    research: {
      completenessPercent: 20,
    },
    createdAt: '2025-08-22',
    updatedAt: '2025-12-02',
    assignedTo: undefined,
    researchStatus: 'pending',
  },
];

/** Mock state change history */
const MOCK_STATE_HISTORY: Record<number, CompanyStateChange[]> = {
  1: [
    {
      date: '2025-12-10',
      user: 'Carlos Mendoza',
      fromState: 'initial_appointment_held',
      toState: 'onboarding_started',
      note: 'Contrato firmado. Cliente activo a partir de enero.',
      tags: ['#cierre', '#contrato'],
    },
    {
      date: '2025-11-28',
      user: 'Carlos Mendoza',
      fromState: 'engaged',
      toState: 'initial_appointment_held',
      note: 'Enviada propuesta comercial para 5 posiciones iniciales.',
      tags: ['#propuesta'],
    },
    {
      date: '2025-11-15',
      user: 'María García',
      fromState: 'prospecting',
      toState: 'engaged',
      note: 'Reunión exitosa con HR Director. Interés confirmado.',
      tags: ['#reunion', '#followup'],
    },
    {
      date: '2025-10-20',
      user: 'Carlos Mendoza',
      fromState: 'lead',
      toState: 'prospecting',
      note: 'Inicio de investigación y primer contacto.',
      tags: [],
    },
  ],
  6: [
    {
      date: '2025-12-12',
      user: 'Carlos Mendoza',
      fromState: 'engaged',
      toState: 'initial_appointment_held',
      note: 'Propuesta enviada para posiciones de DevOps y Product.',
      tags: ['#propuesta'],
    },
    {
      date: '2025-11-20',
      user: 'María García',
      fromState: 'prospecting',
      toState: 'engaged',
      note: 'Demo completada, muy interesados en nuestros servicios.',
      tags: ['#demo', '#positivo'],
    },
  ],
};

/** Mock vacancies by company - references MOCK_VACANCIES companyId */
const MOCK_COMPANY_VACANCIES: Record<number, Vacancy[]> = {
  1: [
    {
      id: 1,
      jobTitle: 'Senior Software Engineer',
      companyId: 1,
      companyName: 'TechCorp Solutions',
      location: 'Miami, FL',
      status: 'active',
      pipelineStage: 'contacted',
      source: 'indeed',
      publishedDate: '2025-12-13',
    },
    {
      id: 11,
      jobTitle: 'Data Scientist',
      companyId: 1,
      companyName: 'TechCorp Solutions',
      location: 'Miami, FL',
      status: 'active',
      pipelineStage: 'detected',
      source: 'indeed',
      publishedDate: '2025-12-14',
    },
    {
      id: 15,
      jobTitle: 'Product Manager',
      companyId: 1,
      companyName: 'TechCorp Solutions',
      location: 'Remote',
      status: 'filled',
      pipelineStage: 'won',
      source: 'linkedin',
      publishedDate: '2025-11-20',
    },
  ],
  6: [
    {
      id: 2,
      jobTitle: 'Product Manager',
      companyId: 6,
      companyName: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      status: 'active',
      pipelineStage: 'proposal',
      source: 'linkedin',
      publishedDate: '2025-12-12',
    },
    {
      id: 6,
      jobTitle: 'DevOps Engineer',
      companyId: 6,
      companyName: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      status: 'active',
      pipelineStage: 'contacted',
      source: 'linkedin',
      publishedDate: '2025-12-14',
    },
  ],
};

@Injectable()
export class CompanyMockService implements ICompanyService {
  private companies = [...MOCK_COMPANIES];
  private nextCompanyId = Math.max(...this.companies.map(c => c.id)) + 1;
  private nextContactId =
    Math.max(...this.companies.flatMap(c => c.contacts.map(contact => contact.id)), 0) + 1;
  private stateHistory = { ...MOCK_STATE_HISTORY };
  private companyVacancies = { ...MOCK_COMPANY_VACANCIES };

  getAll(params?: CompanyFilterParams): Observable<PaginatedResponse<Company>> {
    let filtered = [...this.companies];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(search));
    }

    if (params?.relationshipType) {
      filtered = filtered.filter(c => c.relationshipType === params.relationshipType);
    }

    if (params?.pipelineStage) {
      filtered = filtered.filter(c => c.pipelineStage === params.pipelineStage);
    }

    if (params?.industry) {
      filtered = filtered.filter(c => c.industry === params.industry);
    }

    if (params?.location) {
      const location = params.location.toLowerCase();
      filtered = filtered.filter(c => c.location?.toLowerCase().includes(location));
    }

    // Sort by name ascending
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return of({
      data: paginatedData,
      total: 5186, // Mock total count
      page,
      pageSize,
      totalPages: Math.ceil(5186 / pageSize),
    }).pipe(delay(MOCK_DELAY));
  }

  getById(id: number): Observable<Company> {
    const company = this.companies.find(c => c.id === id);
    if (!company) {
      return throwError(() => new Error(`Company with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }
    return of(company).pipe(delay(MOCK_DELAY));
  }

  create(data: CreateCompanyDto): Observable<Company> {
    const newCompany: Company = {
      id: this.nextCompanyId++,
      name: data.name,
      website: data.website,
      industry: data.industry,
      location: data.location,
      employees: data.employees,
      phone: data.phone,
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
      research: {
        completenessPercent: 0,
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    this.companies.unshift(newCompany);
    return of(newCompany).pipe(delay(MOCK_DELAY));
  }

  update(id: number, data: UpdateCompanyDto): Observable<Company> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Company with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }

    this.companies[index] = {
      ...this.companies[index],
      ...data,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return of(this.companies[index]).pipe(delay(MOCK_DELAY));
  }

  delete(id: number): Observable<void> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index !== -1) {
      this.companies.splice(index, 1);
    }
    return of(undefined).pipe(delay(MOCK_DELAY));
  }

  changeState(id: number, data: ChangeCompanyStateDto): Observable<Company> {
    const company = this.companies.find(c => c.id === id);
    if (!company) {
      return throwError(() => new Error(`Company with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }

    const previousState = company.pipelineStage;
    company.pipelineStage = data.newState;
    company.updatedAt = new Date().toISOString().split('T')[0];

    // Update relationship type based on pipeline stage
    if (data.newState === 'onboarding_started') {
      company.relationshipType = 'client';
    } else if (data.newState === 'lost') {
      company.relationshipType = 'inactive';
    }

    // Add to history
    const historyEntry: CompanyStateChange = {
      date: new Date().toISOString().split('T')[0],
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

    return of(company).pipe(delay(MOCK_DELAY));
  }

  getStateHistory(
    id: number,
    params?: CompanyHistoryFilterParams
  ): Observable<CompanyStateChange[]> {
    let history = this.stateHistory[id] || [];

    if (params?.stage) {
      history = history.filter(h => h.fromState === params.stage || h.toState === params.stage);
    }

    if (params?.user) {
      const user = params.user.toLowerCase();
      history = history.filter(h => h.user.toLowerCase().includes(user));
    }

    if (params?.dateFrom) {
      history = history.filter(h => h.date >= params.dateFrom!);
    }

    if (params?.dateTo) {
      history = history.filter(h => h.date <= params.dateTo!);
    }

    return of(history).pipe(delay(MOCK_DELAY));
  }

  getVacancies(id: number): Observable<Vacancy[]> {
    const vacancies = (this.companyVacancies[id] || []).map(hydrateVacancy);
    return of(vacancies).pipe(delay(MOCK_DELAY));
  }

  updateResearch(id: number, data: UpdateResearchDto): Observable<Research> {
    const company = this.companies.find(c => c.id === id);
    if (!company) {
      return throwError(() => new Error(`Company with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }

    const updatedResearch: Research = {
      ...company.research,
      ...data,
      lastResearchDate: new Date().toISOString().split('T')[0],
      completenessPercent: this.calculateCompletenessPercent({
        ...company.research,
        ...data,
      }),
    };

    company.research = updatedResearch;
    company.updatedAt = new Date().toISOString().split('T')[0];

    return of(updatedResearch).pipe(delay(MOCK_DELAY));
  }

  investigate(data: InvestigateCompanyDto): Observable<Company> {
    // Simulate creating a new company from investigation
    const newCompany: Company = {
      id: this.nextCompanyId++,
      name: data.name,
      website: data.website,
      country: data.country,
      relationshipType: 'lead',
      pipelineStage: 'lead',
      contacts: [],
      research: {
        completenessPercent: 0, // Will be populated async by Prospecting Engine
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    this.companies.unshift(newCompany);

    // In real implementation, this would trigger async research population
    console.log(
      `[CompanyMockService] Investigation started for "${data.name}" in ${data.country}. ETA: ~5 min`
    );

    return of(newCompany).pipe(delay(MOCK_DELAY * 2)); // Slightly longer delay
  }

  createContact(companyId: number, data: CreateContactDto): Observable<Contact> {
    const company = this.companies.find(c => c.id === companyId);
    if (!company) {
      return throwError(() => new Error(`Company with id ${companyId} not found`)).pipe(delay(MOCK_DELAY));
    }

    // If new contact is primary, demote others
    if (data.isPrimary) {
      company.contacts.forEach(c => (c.isPrimary = false));
    }

    const newContact: Contact = {
      id: this.nextContactId++,
      fullName: data.fullName,
      jobTitle: data.jobTitle,
      email: data.email,
      phone: data.phone,
      linkedinUrl: data.linkedinUrl,
      isPrimary: data.isPrimary ?? company.contacts.length === 0, // First contact is primary by default
    };

    company.contacts.push(newContact);
    company.updatedAt = new Date().toISOString().split('T')[0];

    return of(newContact).pipe(delay(MOCK_DELAY));
  }

  updateContact(companyId: number, contactId: number, data: UpdateContactDto): Observable<Contact> {
    const company = this.companies.find(c => c.id === companyId);
    if (!company) {
      return throwError(() => new Error(`Company with id ${companyId} not found`)).pipe(delay(MOCK_DELAY));
    }

    const contactIndex = company.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) {
      return throwError(() => new Error(`Contact with id ${contactId} not found`)).pipe(delay(MOCK_DELAY));
    }

    // If updating to primary, demote others
    if (data.isPrimary) {
      company.contacts.forEach(c => (c.isPrimary = false));
    }

    company.contacts[contactIndex] = {
      ...company.contacts[contactIndex],
      ...data,
    };
    company.updatedAt = new Date().toISOString().split('T')[0];

    return of(company.contacts[contactIndex]).pipe(delay(MOCK_DELAY));
  }

  deleteContact(companyId: number, contactId: number): Observable<void> {
    const company = this.companies.find(c => c.id === companyId);
    if (!company) {
      return throwError(() => new Error(`Company with id ${companyId} not found`)).pipe(delay(MOCK_DELAY));
    }

    const contactIndex = company.contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      company.contacts.splice(contactIndex, 1);
      company.updatedAt = new Date().toISOString().split('T')[0];
    }

    return of(undefined).pipe(delay(MOCK_DELAY));
  }

  /**
   * Calculates research completeness percentage based on filled fields.
   */
  private calculateCompletenessPercent(research: Partial<Research>): number {
    const fields = ['valueProposition', 'mission', 'vision', 'salesPitch'];
    const filledFields = fields.filter(field => research[field as keyof Research] !== undefined);
    return Math.round((filledFields.length / fields.length) * 100);
  }
}
