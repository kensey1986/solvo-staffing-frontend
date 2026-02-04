/**
 * Auth Guard Tests
 *
 * Unit tests for authGuard covering route protection logic.
 */

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AUTH_SERVICE } from '../providers/auth-service.provider';
import { IAuthService } from '../interfaces/auth-service.interface';

describe('authGuard', () => {
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

  it('should allow access when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should call isAuthenticated on the auth service', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });
});
