/**
 * Guest Guard Tests
 *
 * Unit tests for guestGuard covering route protection logic.
 */

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AUTH_SERVICE } from '../providers/auth-service.provider';
import { IAuthService } from '../interfaces/auth-service.interface';

describe('guestGuard', () => {
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRouter: jest.Mocked<Router>;
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    mockUrlTree = {} as UrlTree;

    mockAuthService = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
      getAccessToken: jest.fn(),
      restoreSession: jest.fn(),
    };

    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_SERVICE, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow access when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call isAuthenticated on the auth service', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });
});
