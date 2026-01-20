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
import { LoginResponseDto } from '@core/dtos/auth.dto';
import { User } from '@core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'commercial',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockLoginResponse: LoginResponseDto = {
    user: mockUser,
    accessToken: 'mock-token',
  };

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
      getAccessToken: jest.fn(),
      restoreSession: jest.fn(),
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

  describe('form initialization', () => {
    it('should have an empty form initially', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have password hidden by default', () => {
      expect(component.hidePassword()).toBe(true);
    });

    it('should not be loading initially', () => {
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should require email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should require password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should require minimum password length', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should be invalid when form is empty', () => {
      expect(component.loginForm.invalid).toBe(true);
    });

    it('should be valid with correct input', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456789',
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle password visibility', () => {
      expect(component.hidePassword()).toBe(true);

      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(false);

      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should mark form as touched when invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should set loading state during login', fakeAsync(() => {
      mockAuthService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456789',
      });

      component.onSubmit();
      expect(component.isLoading()).toBe(true);

      tick();

      // Note: isLoading would be reset on error, but on success
      // the component navigates away
    }));

    it('should call authService.login with credentials', fakeAsync(() => {
      mockAuthService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456789',
      });

      component.onSubmit();
      tick();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456789',
      });
    }));

    it('should navigate to dashboard on successful login', fakeAsync(() => {
      mockAuthService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456789',
      });

      component.onSubmit();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should show error snackbar on login failure', () => {
      const errorMessage = 'Email o contraseña incorrectos';
      mockAuthService.login.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();

      // throwError emits synchronously, so the error handler runs immediately
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        errorMessage,
        'Cerrar',
        expect.objectContaining({ duration: 5000 })
      );
      expect(component.isLoading()).toBe(false);
    });

    it('should reset loading state on error', () => {
      mockAuthService.login.mockReturnValue(throwError(() => new Error('Error')));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      // throwError emits synchronously, so by the time onSubmit returns,
      // the error handler has already run and reset isLoading to false
      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });
});
