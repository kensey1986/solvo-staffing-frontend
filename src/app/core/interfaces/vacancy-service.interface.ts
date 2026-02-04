/**
 * Vacancy Service Interface
 *
 * Defines the contract for vacancy service implementations.
 * Both mock and API services must implement this interface.
 */

import { Observable } from 'rxjs';
import {
  ChangeVacancyStateDto,
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyFilterParams,
} from '../dtos/vacancy.dto';
import { PaginatedResponse } from '../models/pagination.model';
import { Vacancy, VacancyStateChange } from '../models/vacancy.model';

/**
 * Interface for vacancy service operations.
 * Follows API-first principle - contract is defined before implementation.
 */
export interface IVacancyService {
  /**
   * Retrieves a paginated list of vacancies with optional filtering.
   * @param params - Filter and pagination parameters
   * @returns Observable of paginated vacancy response
   */
  getAll(params?: VacancyFilterParams): Observable<PaginatedResponse<Vacancy>>;

  /**
   * Retrieves a single vacancy by ID.
   * @param id - Vacancy ID
   * @returns Observable of vacancy
   */
  getById(id: number): Observable<Vacancy>;

  /**
   * Creates a new vacancy.
   * @param data - Vacancy creation data
   * @returns Observable of created vacancy
   */
  create(data: CreateVacancyDto): Observable<Vacancy>;

  /**
   * Updates an existing vacancy.
   * @param id - Vacancy ID
   * @param data - Update data
   * @returns Observable of updated vacancy
   */
  update(id: number, data: UpdateVacancyDto): Observable<Vacancy>;

  /**
   * Deletes a vacancy.
   * @param id - Vacancy ID
   * @returns Observable of void
   */
  delete(id: number): Observable<void>;

  /**
   * Changes the pipeline state of a vacancy.
   * @param id - Vacancy ID
   * @param data - State change data with note
   * @returns Observable of updated vacancy
   */
  changeState(id: number, data: ChangeVacancyStateDto): Observable<Vacancy>;

  /**
   * Retrieves the state change history for a vacancy.
   * @param id - Vacancy ID
   * @returns Observable of state change history
   */
  getStateHistory(id: number): Observable<VacancyStateChange[]>;
}
