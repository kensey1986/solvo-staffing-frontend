/**
 * Vacancy Domain Models
 *
 * Contains all type definitions for vacancy-related entities.
 */

/** Possible statuses for a vacancy */
export type VacancyStatus = 'active' | 'filled' | 'expired';

/** Pipeline stages for vacancy CRM tracking */
export type PipelineStage = 'detected' | 'contacted' | 'proposal' | 'won' | 'lost';

/** Source where the vacancy was found */
export type VacancySource = 'indeed' | 'linkedin' | 'company_website' | 'manual';

/** Seniority levels for job positions */
export type SeniorityLevel =
  | 'entry_level'
  | 'mid_level'
  | 'mid_senior'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'executive';

/** Work modality options */
export type WorkModality = 'on_site' | 'remote' | 'hybrid';

/** Job type options */
export type JobType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';

/**
 * Vacancy entity model.
 * Represents a job vacancy in the system.
 */
export interface Vacancy {
  /** Unique identifier */
  id: number;
  /** Job position title */
  jobTitle: string;
  /** Associated company ID */
  companyId: number;
  /** Associated company name */
  companyName: string;
  /** Job location (City, State) */
  location: string;
  /** Department within the company */
  department?: string;
  /** Seniority level required */
  seniorityLevel?: SeniorityLevel;
  /** Type of employment */
  jobType?: JobType;
  /** Work modality (remote, on-site, hybrid) */
  workModality?: WorkModality;
  /** Whether remote work is viable */
  isRemoteViable?: boolean;
  /** Salary range (e.g., "$80,000 - $100,000") */
  salaryRange?: string;
  /** Current vacancy status */
  status: VacancyStatus;
  /** Current pipeline stage */
  pipelineStage: PipelineStage;
  /** Source where vacancy was found */
  source: VacancySource;
  /** Original job posting URL */
  jobUrl?: string;
  /** Date when vacancy was published */
  publishedDate: string;
  /** Date when vacancy was scraped/detected */
  scrapedAt?: string;
  /** Internal notes about the vacancy */
  notes?: string;
}

/**
 * Vacancy state change history entry.
 * Tracks pipeline stage transitions.
 */
export interface VacancyStateChange {
  /** Change date in ISO format */
  date: string;
  /** User who made the change */
  user: string;
  /** Previous pipeline stage (null if initial state) */
  fromState: PipelineStage | null;
  /** New pipeline stage */
  toState: PipelineStage;
  /** Note explaining the change */
  note: string;
  /** Tags associated with the change */
  tags: string[];
}

/**
 * Labels for vacancy status display.
 */
export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  active: 'Active',
  filled: 'Filled',
  expired: 'Expired',
};

/**
 * Labels for pipeline stage display.
 */
export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  detected: 'Detected',
  contacted: 'Contacted',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

/**
 * Labels for vacancy source display.
 */
export const VACANCY_SOURCE_LABELS: Record<VacancySource, string> = {
  indeed: 'Indeed',
  linkedin: 'LinkedIn',
  company_website: 'Website',
  manual: 'Manual',
};
