/**
 * Company DTOs (Data Transfer Objects)
 *
 * DTOs used for API operations on company entities.
 */

import { PaginationParams } from '../models/pagination.model';
import {
  CompanyPipelineStage,
  CompanyRelationshipType,
  CompanySize,
  Country,
  Industry,
} from '../models/company.model';

/**
 * DTO for creating a new company.
 */
export interface CreateCompanyDto {
  /** Company name (required) */
  name: string;
  /** Company website URL */
  website?: string;
  /** Industry category */
  industry?: Industry;
  /** Company location (City, State) */
  location?: string;
  /** Company size by employee count */
  employees?: CompanySize;
  /** Company phone number */
  phone?: string;
}

/**
 * DTO for updating an existing company.
 */
export interface UpdateCompanyDto {
  /** Company name */
  name?: string;
  /** Company website URL */
  website?: string;
  /** Industry category */
  industry?: Industry;
  /** Company location */
  location?: string;
  /** Company size by employee count */
  employees?: CompanySize;
  /** Company phone number */
  phone?: string;
  /** Type of relationship with the company */
  relationshipType?: CompanyRelationshipType;
  /** Commercial assigned to this company */
  assignedTo?: string;
}

/**
 * DTO for updating company research data.
 */
export interface UpdateResearchDto {
  /** Company's value proposition (max 2000 chars) */
  valueProposition?: string;
  /** Company's mission statement (max 2000 chars) */
  mission?: string;
  /** Company's vision statement (max 2000 chars) */
  vision?: string;
  /** Sales pitch prepared for the company (max 2000 chars) */
  salesPitch?: string;
}

/**
 * DTO for changing company pipeline state.
 */
export interface ChangeCompanyStateDto {
  /** New pipeline stage (required) */
  newState: CompanyPipelineStage;
  /** Note explaining the change (required, min 10 chars, max 500 chars) */
  note: string;
  /** Optional tags for the change */
  tags?: string[];
}

/**
 * DTO for initiating company investigation via Prospecting Engine.
 */
export interface InvestigateCompanyDto {
  /** Company name (required) */
  name: string;
  /** Country where the company is located (required) */
  country: Country;
  /** Company website URL (optional, helps with research) */
  website?: string;
}

/**
 * DTO for creating a new contact.
 */
export interface CreateContactDto {
  /** Contact's full name (required) */
  fullName: string;
  /** Job title/position (required) */
  jobTitle: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Whether this is the primary contact */
  isPrimary?: boolean;
}

/**
 * DTO for updating an existing contact.
 */
export interface UpdateContactDto {
  /** Contact's full name */
  fullName?: string;
  /** Job title/position */
  jobTitle?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Whether this is the primary contact */
  isPrimary?: boolean;
}

/**
 * Filter parameters for company list queries.
 */
export interface CompanyFilterParams extends PaginationParams {
  /** Search by company name */
  search?: string;
  /** Filter by relationship type */
  relationshipType?: CompanyRelationshipType;
  /** Filter by pipeline stage */
  pipelineStage?: CompanyPipelineStage;
  /** Filter by industry */
  industry?: Industry;
  /** Filter by location */
  location?: string;
  /** Filter by assigned commercial */
  assignedTo?: string;
}

/**
 * Filter parameters for company state history queries.
 */
export interface CompanyHistoryFilterParams extends PaginationParams {
  /** Filter by pipeline stage */
  stage?: CompanyPipelineStage;
  /** Filter by user who made the change */
  user?: string;
  /** Filter by date (from) */
  dateFrom?: string;
  /** Filter by date (to) */
  dateTo?: string;
}
