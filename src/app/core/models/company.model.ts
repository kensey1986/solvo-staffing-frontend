/**
 * Company Domain Models
 *
 * Contains all type definitions for company-related entities.
 */

/** Company relationship type with the organization */
export type CompanyRelationshipType = 'client' | 'prospect' | 'lead' | 'inactive';

/** Pipeline stages for company CRM tracking */
export type CompanyPipelineStage =
  | 'lead'
  | 'prospecting'
  | 'engaged'
  | 'proposal'
  | 'client'
  | 'lost';

/** Industry categories */
export type Industry =
  | 'technology'
  | 'healthcare'
  | 'financial_services'
  | 'manufacturing'
  | 'retail'
  | 'energy'
  | 'education'
  | 'logistics'
  | 'construction'
  | 'other';

/** Company size ranges by employee count */
export type CompanySize =
  | '1-50'
  | '50-100'
  | '100-200'
  | '200-500'
  | '500-1000'
  | '1000-5000'
  | '5000+';

/** Countries available for company location */
export type Country = 'USA' | 'Mexico' | 'Colombia' | 'Argentina' | 'Chile' | 'Peru' | 'Brazil';

/**
 * Contact entity model.
 * Represents a contact person within a company.
 */
export interface Contact {
  /** Unique identifier */
  id: number;
  /** Contact's full name */
  fullName: string;
  /** Job title/position */
  jobTitle: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Whether this is the primary contact for the company */
  isPrimary: boolean;
}

/**
 * Research entity model.
 * Contains research data collected about a company.
 */
export interface Research {
  /** Company's value proposition */
  valueProposition?: string;
  /** Company's mission statement */
  mission?: string;
  /** Company's vision statement */
  vision?: string;
  /** Sales pitch prepared for the company */
  salesPitch?: string;
  /** Date when research was last updated */
  lastResearchDate?: string;
  /** Percentage of research completeness (0-100) */
  completenessPercent: number;
}

/**
 * Company entity model.
 * Represents a company in the system.
 */
export interface Company {
  /** Unique identifier */
  id: number;
  /** Company name */
  name: string;
  /** Industry category */
  industry?: Industry;
  /** Company location (City, State) */
  location?: string;
  /** Type of relationship with the company */
  relationshipType: CompanyRelationshipType;
  /** Current pipeline stage */
  pipelineStage: CompanyPipelineStage;
  /** Company website URL */
  website?: string;
  /** Company phone number */
  phone?: string;
  /** Company size by employee count */
  employees?: CompanySize;
  /** Country where the company is located */
  country?: Country;
  /** List of contacts at the company */
  contacts: Contact[];
  /** Research data about the company */
  research?: Research;
  /** Date when the company was created in the system */
  createdAt?: string;
  /** Date when the company was last updated */
  updatedAt?: string;
}

/**
 * Company state change history entry.
 * Tracks pipeline stage transitions.
 */
export interface CompanyStateChange {
  /** Change date in ISO format */
  date: string;
  /** User who made the change */
  user: string;
  /** Previous pipeline stage */
  fromState: CompanyPipelineStage;
  /** New pipeline stage */
  toState: CompanyPipelineStage;
  /** Note explaining the change (required, min 10 chars) */
  note: string;
  /** Tags associated with the change */
  tags: string[];
}

/**
 * Labels for company relationship type display.
 */
export const COMPANY_RELATIONSHIP_LABELS: Record<CompanyRelationshipType, string> = {
  client: 'Cliente',
  prospect: 'Prospecto',
  lead: 'Lead',
  inactive: 'Inactivo',
};

/**
 * Labels for company pipeline stage display.
 */
export const COMPANY_PIPELINE_LABELS: Record<CompanyPipelineStage, string> = {
  lead: 'Lead',
  prospecting: 'Prospecting',
  engaged: 'Engaged',
  proposal: 'Proposal',
  client: 'Client',
  lost: 'Lost',
};

/**
 * Labels for industry display.
 */
export const INDUSTRY_LABELS: Record<Industry, string> = {
  technology: 'Technology',
  healthcare: 'Healthcare',
  financial_services: 'Financial Services',
  manufacturing: 'Manufacturing',
  retail: 'Retail',
  energy: 'Energy',
  education: 'Education',
  logistics: 'Logistics',
  construction: 'Construction',
  other: 'Other',
};

/**
 * Labels for company size display.
 */
export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  '1-50': '1-50',
  '50-100': '50-100',
  '100-200': '100-200',
  '200-500': '200-500',
  '500-1000': '500-1000',
  '1000-5000': '1000-5000',
  '5000+': '5000+',
};

/**
 * Labels for country display.
 */
export const COUNTRY_LABELS: Record<Country, string> = {
  USA: 'USA',
  Mexico: 'Mexico',
  Colombia: 'Colombia',
  Argentina: 'Argentina',
  Chile: 'Chile',
  Peru: 'Peru',
  Brazil: 'Brazil',
};
