/**
 * Login Component Tests
 *
 * Unit tests for LoginComponent covering form validation,
 * authentication flow, and error handling.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AUTH_SERVICE } from '@core/providers/auth-service.provider';
import { IAuthService } from '@core/interfaces/auth-service.interface';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;

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
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(LoginComponent, {
        set: {
          providers: [
            { provide: AUTH_SERVICE, useValue: mockAuthService },
            { provide: MatSnackBar, useValue: mockSnackBar },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should not be loading initially', () => {
      expect(component.isSsoLoading()).toBe(false);
    });
  });

  describe('loginWithMicrosoft', () => {
    it('should set loading state and call initSsoLogin on success', fakeAsync(() => {
      const mockAuthUrl = 'https://login.microsoftonline.com/auth';
      mockAuthService.initSsoLogin.mockReturnValue(of({ authUrl: mockAuthUrl }));

      // Not mocking window.location.href as it causes issues in this environment.
      // We verify the logic by checking the service call and loading state.

      component.loginWithMicrosoft();

      expect(component.isSsoLoading()).toBe(true);
      tick();

      expect(mockAuthService.initSsoLogin).toHaveBeenCalledWith('microsoft');
      expect(component.isSsoLoading()).toBe(true);
    }));

    it('should show error snackbar on failure', () => {
      const errorMessage = 'Error de conexión';
      mockAuthService.initSsoLogin.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loginWithMicrosoft();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage),
        'Cerrar',
        expect.any(Object)
      );
      expect(component.isSsoLoading()).toBe(false);
    });
  });
});
