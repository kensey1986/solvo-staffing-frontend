/**
 * Vacancy Mock Service
 *
 * Mock implementation of IVacancyService for development and testing.
 * Simulates API responses with static data and artificial delays.
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../../dtos/vacancy.dto';
import { IVacancyService } from '../../interfaces/vacancy-service.interface';
import { PaginatedResponse } from '../../models/pagination.model';
import {
  JobType,
  SeniorityLevel,
  Vacancy,
  VacancySource,
  VacancyStateChange,
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

const COMPANY_ID_TO_NAME: Record<number, string> = Object.entries(COMPANY_NAME_TO_ID).reduce(
  (acc, [name, id]) => ({ ...acc, [id]: name }),
  {} as Record<number, string>
);

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

function buildDescription(
  title: string,
  companyName: string,
  department: string,
  seniority: SeniorityLevel
): string {
  const responsibilities = {
    Engineering: [
      'Design and develop scalable software solutions',
      'Collaborate with cross-functional teams',
      'Participate in code reviews and architecture decisions',
      'Maintain high standards for code quality and testing',
    ],
    Product: [
      'Define product requirements and user stories',
      'Partner with design and engineering teams',
      'Analyze product metrics and customer feedback',
      'Drive roadmap execution and stakeholder alignment',
    ],
    Sales: [
      'Manage the sales pipeline and prospecting activities',
      'Build relationships with key decision makers',
      'Prepare proposals and negotiate terms',
      'Collaborate with marketing to drive demand',
    ],
    Finance: [
      'Prepare financial reports and analysis',
      'Support budgeting and forecasting activities',
      'Ensure compliance with financial policies',
      'Partner with business leaders on insights',
    ],
    Healthcare: [
      'Deliver high-quality patient care',
      'Maintain accurate clinical documentation',
      'Collaborate with multidisciplinary teams',
      'Ensure compliance with safety standards',
    ],
    Marketing: [
      'Plan and execute marketing campaigns',
      'Create content and messaging strategies',
      'Analyze campaign performance metrics',
      'Coordinate with cross-functional teams',
    ],
    Operations: [
      'Optimize operational workflows and processes',
      'Coordinate teams to meet service targets',
      'Track KPIs and continuous improvement',
      'Ensure compliance with company policies',
    ],
    General: [
      'Support day-to-day business operations',
      'Coordinate with internal stakeholders',
      'Maintain accurate documentation and reporting',
      'Contribute to process improvements',
    ],
  };

  const requirements = {
    Engineering: [
      'Proficiency with modern development practices',
      'Experience with cloud platforms',
      'Strong problem-solving skills',
    ],
    Product: [
      'Experience translating business needs into product requirements',
      'Strong analytical and communication skills',
    ],
    Sales: [
      'Proven track record meeting sales targets',
      'Excellent communication and negotiation skills',
    ],
    Finance: [
      'Strong analytical skills and attention to detail',
      'Knowledge of financial reporting standards',
    ],
    Healthcare: [
      'Valid certifications or licenses where required',
      'Commitment to patient care excellence',
    ],
    Marketing: [
      'Experience with digital marketing channels',
      'Strong writing and campaign planning skills',
    ],
    Operations: [
      'Experience managing operational workflows',
      'Strong organizational and leadership skills',
    ],
    General: [
      'Strong organizational skills',
      'Ability to work collaboratively across teams',
    ],
  };

  const responsibilityList =
    (responsibilities[department as keyof typeof responsibilities] || responsibilities.General)
      .map((item: string) => `• ${item}`)
    .join('\n');
  const requirementList =
    (requirements[department as keyof typeof requirements] || requirements.General)
      .map((item: string) => `• ${item}`)
    .join('\n');

  return `We are looking for a ${title} to join ${companyName}. The ideal candidate will have ${
    seniority === 'entry_level' ? 'foundational' : seniority
  } experience and a passion for excellence.\n\n<strong>Responsibilities:</strong>\n${responsibilityList}\n\n<strong>Requirements:</strong>\n${requirementList}`;
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

function normalizeVacancy(vacancy: Vacancy): Vacancy {
  const resolvedCompanyName =
    vacancy.companyName || COMPANY_ID_TO_NAME[vacancy.companyId] || 'Unknown Company';
  const resolvedCompanyId = COMPANY_NAME_TO_ID[resolvedCompanyName] || vacancy.companyId;
  const department = vacancy.department || inferDepartment(vacancy.jobTitle);
  const seniorityLevel = vacancy.seniorityLevel || inferSeniority(vacancy.jobTitle);
  const jobType = vacancy.jobType || inferJobType(vacancy.jobTitle);
  const workModality = vacancy.workModality || inferWorkModality(vacancy.jobTitle, vacancy.location);
  const isRemoteViable = vacancy.isRemoteViable ?? workModality !== 'on_site';
  const salaryRange = vacancy.salaryRange || inferSalaryRange(department, seniorityLevel);
  const publishedDate = vacancy.publishedDate;
  const scrapedAt =
    vacancy.scrapedAt || (publishedDate ? `${publishedDate}T14:30:00Z` : new Date().toISOString());
  const jobUrl =
    vacancy.jobUrl ||
    (vacancy.source === 'company_website'
      ? `${SOURCE_DOMAIN.company_website}${slugify(resolvedCompanyName)}.com/jobs/${slugify(
          vacancy.jobTitle
        )}`
      : `${SOURCE_DOMAIN[vacancy.source]}${slugify(vacancy.jobTitle)}-${resolvedCompanyId}`);
  const description =
    vacancy.description ||
    buildDescription(vacancy.jobTitle, resolvedCompanyName, department, seniorityLevel);
  const notes = vacancy.notes || buildNotes(vacancy.pipelineStage);

  return {
    ...vacancy,
    companyId: resolvedCompanyId,
    companyName: resolvedCompanyName,
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

/** Mock vacancy data */
const RAW_MOCK_VACANCIES: Vacancy[] = [
  {
    id: 1,
    jobTitle: 'Senior Software Engineer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-12-12',
    assignedTo: 'Carlos M.',
  },
  {
    id: 2,
    jobTitle: 'Product Manager',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-12-11',
    assignedTo: 'Carlos M.',
  },
  {
    id: 3,
    jobTitle: 'Registered Nurse - ICU',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-10',
    assignedTo: undefined,
  },
  {
    id: 4,
    jobTitle: 'Financial Analyst',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-12-04',
    assignedTo: 'Carlos M.',
  },
  {
    id: 5,
    jobTitle: 'Store Manager',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-12-09',
    assignedTo: undefined,
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
    publishedDate: '2025-12-13',
    assignedTo: 'María G.',
  },
  {
    id: 7,
    jobTitle: 'Warehouse Supervisor',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'indeed',
    publishedDate: '2025-11-19',
    assignedTo: 'Juan P.',
  },
  {
    id: 8,
    jobTitle: 'Marketing Coordinator',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-08',
    assignedTo: undefined,
  },
  {
    id: 9,
    jobTitle: 'Solar Installation Technician',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-12-07',
    assignedTo: 'María G.',
  },
  {
    id: 10,
    jobTitle: 'Project Manager - Construction',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-12-06',
    assignedTo: 'Juan P.',
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
    publishedDate: '2025-12-13',
    assignedTo: undefined,
  },
  {
    id: 12,
    jobTitle: 'HR Generalist',
    companyId: 12,
    companyName: 'Global Manufacturing Inc',
    location: 'Houston, TX',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-12-05',
    assignedTo: undefined,
  },
  {
    id: 13,
    jobTitle: 'Full Stack Developer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-12-03',
    assignedTo: 'Carlos M.',
  },
  {
    id: 14,
    jobTitle: 'UX Designer',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'indeed',
    publishedDate: '2025-12-02',
    assignedTo: 'María G.',
  },
  {
    id: 15,
    jobTitle: 'Account Executive',
    companyId: 13,
    companyName: 'SalesForce Pro',
    location: 'Austin, TX',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-12-01',
    assignedTo: undefined,
  },
  {
    id: 16,
    jobTitle: 'Quality Assurance Engineer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-11-30',
    assignedTo: 'Juan P.',
  },
  {
    id: 17,
    jobTitle: 'Business Analyst',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'company_website',
    publishedDate: '2025-11-29',
    assignedTo: 'Carlos M.',
  },
  {
    id: 18,
    jobTitle: 'Network Administrator',
    companyId: 14,
    companyName: 'SecureNet Systems',
    location: 'Seattle, WA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-11-28',
    assignedTo: undefined,
  },
  {
    id: 19,
    jobTitle: 'Customer Success Manager',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'filled',
    pipelineStage: 'won',
    source: 'linkedin',
    publishedDate: '2025-11-27',
    assignedTo: 'María G.',
  },
  {
    id: 20,
    jobTitle: 'Mechanical Engineer',
    companyId: 15,
    companyName: 'Industrial Dynamics',
    location: 'Detroit, MI',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-11-26',
    assignedTo: 'Juan P.',
  },
  {
    id: 21,
    jobTitle: 'Content Writer',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-11-25',
    assignedTo: undefined,
  },
  {
    id: 22,
    jobTitle: 'iOS Developer',
    companyId: 16,
    companyName: 'AppVenture Studios',
    location: 'Los Angeles, CA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-11-24',
    assignedTo: 'Carlos M.',
  },
  {
    id: 23,
    jobTitle: 'Supply Chain Analyst',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-11-23',
    assignedTo: 'María G.',
  },
  {
    id: 24,
    jobTitle: 'Compliance Officer',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'company_website',
    publishedDate: '2025-11-22',
    assignedTo: 'Juan P.',
  },
  {
    id: 25,
    jobTitle: 'Android Developer',
    companyId: 16,
    companyName: 'AppVenture Studios',
    location: 'Los Angeles, CA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-11-21',
    assignedTo: undefined,
  },
  {
    id: 26,
    jobTitle: 'Clinical Research Coordinator',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-11-20',
    assignedTo: 'Carlos M.',
  },
  {
    id: 27,
    jobTitle: 'Operations Manager',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-11-18',
    assignedTo: 'María G.',
  },
  {
    id: 28,
    jobTitle: 'Electrical Engineer',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-11-17',
    assignedTo: 'Juan P.',
  },
  {
    id: 29,
    jobTitle: 'Technical Writer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-11-16',
    assignedTo: undefined,
  },
  {
    id: 30,
    jobTitle: 'Site Reliability Engineer',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-11-15',
    assignedTo: 'Carlos M.',
  },
  {
    id: 31,
    jobTitle: 'Pharmacist',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'indeed',
    publishedDate: '2025-11-14',
    assignedTo: 'María G.',
  },
  {
    id: 32,
    jobTitle: 'Investment Banker',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-11-13',
    assignedTo: undefined,
  },
  {
    id: 33,
    jobTitle: 'Retail Associate',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'indeed',
    publishedDate: '2025-11-12',
    assignedTo: 'Juan P.',
  },
  {
    id: 34,
    jobTitle: 'Cloud Architect',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-11-11',
    assignedTo: 'Carlos M.',
  },
  {
    id: 35,
    jobTitle: 'Fleet Manager',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'company_website',
    publishedDate: '2025-11-10',
    assignedTo: 'María G.',
  },
  {
    id: 36,
    jobTitle: 'Curriculum Developer',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-11-09',
    assignedTo: 'Juan P.',
  },
  {
    id: 37,
    jobTitle: 'Wind Turbine Technician',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-11-08',
    assignedTo: undefined,
  },
  {
    id: 38,
    jobTitle: 'Civil Engineer',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-11-07',
    assignedTo: 'Carlos M.',
  },
  {
    id: 39,
    jobTitle: 'Scrum Master',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-11-06',
    assignedTo: 'María G.',
  },
  {
    id: 40,
    jobTitle: 'Machine Learning Engineer',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-11-05',
    assignedTo: undefined,
  },
  {
    id: 41,
    jobTitle: 'Physical Therapist',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'company_website',
    publishedDate: '2025-11-04',
    assignedTo: 'Juan P.',
  },
  {
    id: 42,
    jobTitle: 'Risk Analyst',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'linkedin',
    publishedDate: '2025-11-03',
    assignedTo: 'Carlos M.',
  },
  {
    id: 43,
    jobTitle: 'Visual Merchandiser',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'indeed',
    publishedDate: '2025-11-02',
    assignedTo: 'María G.',
  },
  {
    id: 44,
    jobTitle: 'Security Engineer',
    companyId: 14,
    companyName: 'SecureNet Systems',
    location: 'Seattle, WA',
    status: 'filled',
    pipelineStage: 'won',
    source: 'linkedin',
    publishedDate: '2025-11-01',
    assignedTo: 'Juan P.',
  },
  {
    id: 45,
    jobTitle: 'Logistics Coordinator',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-10-31',
    assignedTo: undefined,
  },
  {
    id: 46,
    jobTitle: 'Instructional Designer',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'company_website',
    publishedDate: '2025-10-30',
    assignedTo: 'Carlos M.',
  },
  {
    id: 47,
    jobTitle: 'Solar Panel Engineer',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-10-29',
    assignedTo: 'María G.',
  },
  {
    id: 48,
    jobTitle: 'Safety Manager',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-10-28',
    assignedTo: undefined,
  },
  {
    id: 49,
    jobTitle: 'Backend Developer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-10-27',
    assignedTo: 'Juan P.',
  },
  {
    id: 50,
    jobTitle: 'Database Administrator',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-10-26',
    assignedTo: 'Carlos M.',
  },
  {
    id: 51,
    jobTitle: 'Medical Lab Technician',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'company_website',
    publishedDate: '2025-10-25',
    assignedTo: 'María G.',
  },
  {
    id: 52,
    jobTitle: 'Tax Accountant',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-10-24',
    assignedTo: undefined,
  },
  {
    id: 53,
    jobTitle: 'District Manager',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-10-23',
    assignedTo: 'Juan P.',
  },
  {
    id: 54,
    jobTitle: 'Platform Engineer',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'linkedin',
    publishedDate: '2025-10-22',
    assignedTo: 'Carlos M.',
  },
  {
    id: 55,
    jobTitle: 'Dispatch Supervisor',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'company_website',
    publishedDate: '2025-10-21',
    assignedTo: 'María G.',
  },
  {
    id: 56,
    jobTitle: 'E-Learning Specialist',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-10-20',
    assignedTo: 'Juan P.',
  },
  {
    id: 57,
    jobTitle: 'Energy Consultant',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-10-19',
    assignedTo: undefined,
  },
  {
    id: 58,
    jobTitle: 'Estimator',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-10-18',
    assignedTo: 'Carlos M.',
  },
  {
    id: 59,
    jobTitle: 'Frontend Developer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-10-17',
    assignedTo: 'María G.',
  },
  {
    id: 60,
    jobTitle: 'Product Designer',
    companyId: 16,
    companyName: 'AppVenture Studios',
    location: 'Los Angeles, CA',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-10-16',
    assignedTo: undefined,
  },
  {
    id: 61,
    jobTitle: 'Radiologic Technologist',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-10-15',
    assignedTo: 'Juan P.',
  },
  {
    id: 62,
    jobTitle: 'Credit Analyst',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'filled',
    pipelineStage: 'won',
    source: 'linkedin',
    publishedDate: '2025-10-14',
    assignedTo: 'Carlos M.',
  },
  {
    id: 63,
    jobTitle: 'Buyer',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'active',
    pipelineStage: 'detected',
    source: 'indeed',
    publishedDate: '2025-10-13',
    assignedTo: undefined,
  },
  {
    id: 64,
    jobTitle: 'Penetration Tester',
    companyId: 14,
    companyName: 'SecureNet Systems',
    location: 'Seattle, WA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'company_website',
    publishedDate: '2025-10-12',
    assignedTo: 'María G.',
  },
  {
    id: 65,
    jobTitle: 'Route Planner',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'linkedin',
    publishedDate: '2025-10-11',
    assignedTo: 'Juan P.',
  },
  {
    id: 66,
    jobTitle: 'Training Coordinator',
    companyId: 8,
    companyName: 'EduTech Learning',
    location: 'Boston, MA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-10-10',
    assignedTo: 'Carlos M.',
  },
  {
    id: 67,
    jobTitle: 'Battery Systems Engineer',
    companyId: 9,
    companyName: 'Green Energy Corp',
    location: 'Denver, CO',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-10-09',
    assignedTo: 'María G.',
  },
  {
    id: 68,
    jobTitle: 'Field Superintendent',
    companyId: 10,
    companyName: 'Construction Plus',
    location: 'Phoenix, AZ',
    status: 'filled',
    pipelineStage: 'won',
    source: 'indeed',
    publishedDate: '2025-10-08',
    assignedTo: 'Juan P.',
  },
  {
    id: 69,
    jobTitle: 'Technical Support Specialist',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    status: 'active',
    pipelineStage: 'detected',
    source: 'company_website',
    publishedDate: '2025-10-07',
    assignedTo: undefined,
  },
  {
    id: 70,
    jobTitle: 'Sales Development Representative',
    companyId: 13,
    companyName: 'SalesForce Pro',
    location: 'Austin, TX',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'linkedin',
    publishedDate: '2025-10-06',
    assignedTo: 'Carlos M.',
  },
  {
    id: 71,
    jobTitle: 'Dental Hygienist',
    companyId: 3,
    companyName: 'HealthFirst Medical',
    location: 'Atlanta, GA',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'indeed',
    publishedDate: '2025-10-05',
    assignedTo: 'María G.',
  },
  {
    id: 72,
    jobTitle: 'Portfolio Manager',
    companyId: 4,
    companyName: 'Financial Partners LLC',
    location: 'New York, NY',
    status: 'active',
    pipelineStage: 'detected',
    source: 'linkedin',
    publishedDate: '2025-10-04',
    assignedTo: undefined,
  },
  {
    id: 73,
    jobTitle: 'Loss Prevention Specialist',
    companyId: 5,
    companyName: 'Retail Masters Group',
    location: 'Chicago, IL',
    status: 'expired',
    pipelineStage: 'lost',
    source: 'company_website',
    publishedDate: '2025-10-03',
    assignedTo: 'Juan P.',
  },
  {
    id: 74,
    jobTitle: 'API Developer',
    companyId: 2,
    companyName: 'CloudScale Technologies',
    location: 'San Francisco, CA',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-10-02',
    assignedTo: 'Carlos M.',
  },
  {
    id: 75,
    jobTitle: 'Inventory Manager',
    companyId: 7,
    companyName: 'Logistics Pro',
    location: 'Dallas, TX',
    status: 'active',
    pipelineStage: 'proposal',
    source: 'linkedin',
    publishedDate: '2025-10-01',
    assignedTo: 'María G.',
  },
];

export const MOCK_VACANCIES: Vacancy[] = RAW_MOCK_VACANCIES.map(normalizeVacancy);

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
      user: 'Sistema',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected automatically from Indeed.',
      tags: ['#auto'],
    },
  ],
  2: [
    {
      date: '2025-12-18T16:45:00Z',
      user: 'María García',
      fromState: 'proposal',
      toState: 'won',
      note: 'Contract signed. Starting onboarding process next week.',
      tags: ['#cerrado', '#éxito'],
    },
    {
      date: '2025-12-15T11:20:00Z',
      user: 'María García',
      fromState: 'contacted',
      toState: 'proposal',
      note: 'Sent proposal with 3 candidate profiles. Client reviewing.',
      tags: ['#propuesta', '#candidatos'],
    },
    {
      date: '2025-12-12T09:00:00Z',
      user: 'Carlos Mendoza',
      fromState: 'detected',
      toState: 'contacted',
      note: 'Initial call with hiring manager. Very interested in our services.',
      tags: ['#llamada', '#interesado'],
    },
    {
      date: '2025-12-10T08:15:00Z',
      user: 'Sistema',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected automatically from LinkedIn.',
      tags: ['#auto'],
    },
  ],
  3: [
    {
      date: '2025-12-17T14:00:00Z',
      user: 'Juan Pérez',
      fromState: 'contacted',
      toState: 'lost',
      note: 'Client decided to hire internally. No further action needed.',
      tags: ['#perdido', '#interno'],
    },
    {
      date: '2025-12-11T10:30:00Z',
      user: 'Juan Pérez',
      fromState: 'detected',
      toState: 'contacted',
      note: 'Reached out via email. Scheduled call for tomorrow.',
      tags: ['#email', '#reunión'],
    },
    {
      date: '2025-12-09T16:00:00Z',
      user: 'Sistema',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected from company website.',
      tags: ['#auto'],
    },
  ],
  4: [
    {
      date: '2025-12-16T09:30:00Z',
      user: 'Carlos Mendoza',
      fromState: 'detected',
      toState: 'contacted',
      note: 'Left voicemail with HR department. Will follow up in 2 days.',
      tags: ['#llamada', '#seguimiento'],
    },
    {
      date: '2025-12-14T11:00:00Z',
      user: 'Sistema',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected automatically from Indeed.',
      tags: ['#auto'],
    },
  ],
  5: [
    {
      date: '2025-12-19T10:00:00Z',
      user: 'María García',
      fromState: 'contacted',
      toState: 'proposal',
      note: 'Preparing proposal with salary expectations and timeline.',
      tags: ['#propuesta'],
    },
    {
      date: '2025-12-16T15:30:00Z',
      user: 'María García',
      fromState: 'detected',
      toState: 'contacted',
      note: 'Had a great call with the talent acquisition team.',
      tags: ['#llamada', '#positivo'],
    },
    {
      date: '2025-12-13T09:45:00Z',
      user: 'Sistema',
      fromState: null,
      toState: 'detected',
      note: 'Vacancy detected automatically from LinkedIn.',
      tags: ['#auto'],
    },
  ],
  6: [
    {
      date: '2025-12-20T11:15:00Z',
      user: 'Juan Pérez',
      fromState: 'proposal',
      toState: 'won',
      note: 'Deal closed! Client accepted our terms. Fee: 20%.',
      tags: ['#cerrado', '#20%'],
    },
    {
      date: '2025-12-17T14:30:00Z',
      user: 'Carlos Mendoza',
      fromState: 'contacted',
      toState: 'proposal',
      note: 'Sent comprehensive proposal with 5 candidate options.',
      tags: ['#propuesta', '#candidatos'],
    },
    {
      date: '2025-12-14T10:00:00Z',
      user: 'Carlos Mendoza',
      fromState: 'detected',
      toState: 'contacted',
      note: 'Initial outreach email sent. Company is actively hiring.',
      tags: ['#email', '#urgente'],
    },
    {
      date: '2025-12-12T16:30:00Z',
      user: 'Sistema',
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
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }).pipe(delay(MOCK_DELAY));
  }

  getById(id: number): Observable<Vacancy> {
    const vacancy = this.vacancies.find(v => v.id === id);
    if (!vacancy) {
      return throwError(() => new Error(`Vacancy with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }
    return of(vacancy).pipe(delay(MOCK_DELAY));
  }

  create(data: CreateVacancyDto): Observable<Vacancy> {
    const newVacancy: Vacancy = normalizeVacancy({
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
    });

    this.vacancies.unshift(newVacancy);
    return of(newVacancy).pipe(delay(MOCK_DELAY));
  }

  update(id: number, data: UpdateVacancyDto): Observable<Vacancy> {
    const index = this.vacancies.findIndex(v => v.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Vacancy with id ${id} not found`)).pipe(delay(MOCK_DELAY));
    }

    this.vacancies[index] = normalizeVacancy({ ...this.vacancies[index], ...data });
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
      return throwError(() => new Error(`Vacancy with id ${id} not found`)).pipe(delay(MOCK_DELAY));
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
