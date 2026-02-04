/**
 * Company Service Interface
 *
 * Defines the contract for company service implementations.
 * Both mock and API services must implement this interface.
 */

import { Observable } from 'rxjs';
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
} from '../dtos/company.dto';
import { PaginatedResponse } from '../models/pagination.model';
import { Company, CompanyStateChange, Contact, Research } from '../models/company.model';
import { Vacancy } from '../models/vacancy.model';

/**
 * Interface for company service operations.
 * Follows API-first principle - contract is defined before implementation.
 */
export interface ICompanyService {
  /**
   * Retrieves a paginated list of companies with optional filtering.
   * @param params - Filter and pagination parameters
   * @returns Observable of paginated company response
   */
  getAll(params?: CompanyFilterParams): Observable<PaginatedResponse<Company>>;

  /**
   * Retrieves a single company by ID.
   * @param id - Company ID
   * @returns Observable of company with contacts and research
   */
  getById(id: number): Observable<Company>;

  /**
   * Creates a new company.
   * @param data - Company creation data
   * @returns Observable of created company
   */
  create(data: CreateCompanyDto): Observable<Company>;

  /**
   * Updates an existing company.
   * @param id - Company ID
   * @param data - Update data
   * @returns Observable of updated company
   */
  update(id: number, data: UpdateCompanyDto): Observable<Company>;

  /**
   * Deletes a company.
   * @param id - Company ID
   * @returns Observable of void
   */
  delete(id: number): Observable<void>;

  /**
   * Changes the pipeline state of a company.
   * @param id - Company ID
   * @param data - State change data with note (min 10 chars) and optional tags
   * @returns Observable of updated company
   */
  changeState(id: number, data: ChangeCompanyStateDto): Observable<Company>;

  /**
   * Retrieves the state change history for a company.
   * @param id - Company ID
   * @param params - Optional filter parameters
   * @returns Observable of state changes array
   */
  getStateHistory(
    id: number,
    params?: CompanyHistoryFilterParams
  ): Observable<CompanyStateChange[]>;

  /**
   * Retrieves vacancies associated with a company.
   * @param id - Company ID
   * @returns Observable of vacancies array
   */
  getVacancies(id: number): Observable<Vacancy[]>;

  /**
   * Updates the research data for a company.
   * @param id - Company ID
   * @param data - Research update data
   * @returns Observable of updated research
   */
  updateResearch(id: number, data: UpdateResearchDto): Observable<Research>;

  /**
   * Initiates company investigation via the Prospecting Engine.
   * @param data - Investigation request data
   * @returns Observable of created company (with research populated async)
   */
  investigate(data: InvestigateCompanyDto): Observable<Company>;

  /**
   * Creates a new contact for a company.
   * @param companyId - Company ID
   * @param data - Contact creation data
   * @returns Observable of created contact
   */
  createContact(companyId: number, data: CreateContactDto): Observable<Contact>;

  /**
   * Updates an existing contact.
   * @param companyId - Company ID
   * @param contactId - Contact ID
   * @param data - Contact update data
   * @returns Observable of updated contact
   */
  updateContact(companyId: number, contactId: number, data: UpdateContactDto): Observable<Contact>;

  /**
   * Deletes a contact.
   * @param companyId - Company ID
   * @param contactId - Contact ID
   * @returns Observable of void
   */
  deleteContact(companyId: number, contactId: number): Observable<void>;
}
