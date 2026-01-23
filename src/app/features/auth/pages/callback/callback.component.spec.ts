/**
 * Callback Component Tests
 *
 * Unit tests for CallbackComponent covering SSO callback processing,
 * token handling, and error scenarios.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { CallbackComponent } from './callback.component';
import { AUTH_SERVICE } from '@core/providers/auth-service.provider';
import { IAuthService } from '@core/interfaces/auth-service.interface';
import { LoginResponseDto } from '@core/dtos/auth.dto';
import { User } from '@core/models/user.model';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture: ComponentFixture<CallbackComponent>;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    email: 'sso.user@microsoft.com',
    firstName: 'SSO',
    lastName: 'User',
    role: 'commercial',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockLoginResponse: LoginResponseDto = {
    user: mockUser,
    accessToken: 'mock-sso-token',
  };

  const createComponent = (queryParams: Record<string, string | null>) => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: {
          queryParamMap: convertToParamMap(queryParams),
        },
      },
    });

    fixture = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
      getAccessToken: jest.fn(),
      restoreSession: jest.fn(),
      initSsoLogin: jest.fn(),
      handleSsoCallback: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    mockSnackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [CallbackComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    })
      .overrideComponent(CallbackComponent, {
        set: {
          providers: [
            { provide: AUTH_SERVICE, useValue: mockAuthService },
            { provide: MatSnackBar, useValue: mockSnackBar },
          ],
        },
      })
      .compileComponents();
  });

  it('should create', () => {
    mockAuthService.handleSsoCallback.mockReturnValue(of(mockLoginResponse));
    createComponent({ token: 'valid-token' });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('successful callback', () => {
    it('should process valid token and navigate to dashboard', fakeAsync(() => {
      mockAuthService.handleSsoCallback.mockReturnValue(of(mockLoginResponse));
      createComponent({ token: 'valid-token' });
      fixture.detectChanges();

      tick();

      expect(mockAuthService.handleSsoCallback).toHaveBeenCalledWith('valid-token');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should show processing state initially', () => {
      mockAuthService.handleSsoCallback.mockReturnValue(of(mockLoginResponse));
      createComponent({ token: 'valid-token' });

      expect(component.isProcessing()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle error parameter in URL', fakeAsync(() => {
      createComponent({ error: 'access_denied' });
      fixture.detectChanges();

      tick(2100);

      expect(component.isProcessing()).toBe(false);
      expect(component.errorMessage()).toContain('access_denied');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));

    it('should handle missing token', fakeAsync(() => {
      createComponent({});
      fixture.detectChanges();

      tick(2100);

      expect(component.isProcessing()).toBe(false);
      expect(component.errorMessage()).toBe('No se recibió token de autenticación');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));

    it('should handle callback service error', fakeAsync(() => {
      mockAuthService.handleSsoCallback.mockReturnValue(
        throwError(() => new Error('Token SSO inválido'))
      );
      createComponent({ token: 'invalid-token' });
      fixture.detectChanges();

      tick(2100);

      expect(component.isProcessing()).toBe(false);
      expect(component.errorMessage()).toBe('Token SSO inválido');
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));
  });
});
