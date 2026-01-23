/**
 * Vacancy DTOs (Data Transfer Objects)
 *
 * DTOs used for API operations on vacancy entities.
 */

import { PaginationParams } from '../models/pagination.model';
import {
  PipelineStage,
  SeniorityLevel,
  VacancySource,
  VacancyStatus,
} from '../models/vacancy.model';

/**
 * DTO for creating a new vacancy.
 */
export interface CreateVacancyDto {
  /** Job position title (required) */
  jobTitle: string;
  /** Associated company ID (required) */
  companyId: number;
  /** Job location */
  location?: string;
  /** Department within the company */
  department?: string;
  /** Seniority level required */
  seniorityLevel?: SeniorityLevel;
  /** Salary range */
  salaryRange?: string;
}

/**
 * DTO for updating an existing vacancy.
 */
export interface UpdateVacancyDto {
  /** Job position title */
  jobTitle?: string;
  /** Current vacancy status */
  status?: VacancyStatus;
  /** Department within the company */
  department?: string;
  /** Seniority level required */
  seniorityLevel?: SeniorityLevel;
  /** Salary range */
  salaryRange?: string;
  /** Internal notes about the vacancy */
  notes?: string;
  /** Commercial assigned to this vacancy */
  assignedTo?: string;
}

/**
 * DTO for changing vacancy pipeline state.
 */
export interface ChangeVacancyStateDto {
  /** New pipeline stage (required) */
  newState: PipelineStage;
  /** Note explaining the change (required, min 10 chars) */
  note: string;
  /** Optional tags for the change */
  tags?: string[];
}

/**
 * Filter parameters for vacancy list queries.
 */
export interface VacancyFilterParams extends PaginationParams {
  /** Search by job title */
  search?: string;
  /** Filter by vacancy status */
  status?: VacancyStatus;
  /** Filter by pipeline stage */
  pipelineStage?: PipelineStage;
  /** Filter by source */
  source?: VacancySource;
  /** Filter by US state */
  state?: string;
  /** Filter by company name */
  company?: string;
  /** Filter by published date (from) */
  dateFrom?: string;
  /** Filter by published date (to) */
  dateTo?: string;
  /** Filter by assigned commercial */
  assignedTo?: string;
}
