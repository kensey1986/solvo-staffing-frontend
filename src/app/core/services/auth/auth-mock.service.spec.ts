/**
 * Auth Mock Service Tests
 *
 * Unit tests for AuthMockService covering login, logout,
 * session management, and authentication state.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthMockService } from './auth-mock.service';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { User } from '../../models/user.model';

describe('AuthMockService', () => {
  let service: AuthMockService;

  const VALID_EMAIL = 'testuser@gmail.com';
  const VALID_PASSWORD = '123456789*';
  const TOKEN_KEY = 'solvo_token';
  const USER_KEY = 'solvo_user';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthMockService],
    });
    service = TestBed.inject(AuthMockService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };

      let result: LoginResponseDto | null = null;
      service.login(credentials).subscribe(res => (result = res));
      tick(500);

      expect(result).toBeTruthy();
      expect(result!.user).toBeDefined();
      expect(result!.user.email).toBe(VALID_EMAIL);
      expect(result!.accessToken).toBeDefined();
      expect(result!.accessToken).toContain('mock-jwt-');
    }));

    it('should store token and user in localStorage on successful login', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };

      service.login(credentials).subscribe();
      tick(500);

      expect(localStorage.getItem(TOKEN_KEY)).toBeTruthy();
      expect(localStorage.getItem(USER_KEY)).toBeTruthy();
    }));

    it('should set isAuthenticated to true after successful login', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };

      expect(service.isAuthenticated()).toBe(false);

      service.login(credentials).subscribe();
      tick(500);

      expect(service.isAuthenticated()).toBe(true);
    }));

    it('should fail with invalid email', fakeAsync(() => {
      const credentials: LoginDto = {
        email: 'invalid@email.com',
        password: VALID_PASSWORD,
      };

      let error: Error | null = null;
      service.login(credentials).subscribe({
        error: (err: Error) => (error = err),
      });
      tick(500);

      expect(error).toBeTruthy();
      expect(error!.message).toBe('Email o contraseña incorrectos');
    }));

    it('should fail with invalid password', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: 'wrongpassword',
      };

      let error: Error | null = null;
      service.login(credentials).subscribe({
        error: (err: Error) => (error = err),
      });
      tick(500);

      expect(error).toBeTruthy();
      expect(error!.message).toBe('Email o contraseña incorrectos');
    }));

    it('should not store anything in localStorage on failed login', fakeAsync(() => {
      const credentials: LoginDto = {
        email: 'invalid@email.com',
        password: 'wrongpassword',
      };

      service.login(credentials).subscribe({ error: () => {} });
      tick(500);

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    }));
  });

  describe('logout', () => {
    it('should clear session on logout', fakeAsync(() => {
      // First login
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };
      service.login(credentials).subscribe();
      tick(500);

      expect(service.isAuthenticated()).toBe(true);

      // Then logout
      service.logout().subscribe();
      tick(250);

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    }));
  });

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', fakeAsync(() => {
      let user: User | null = null;
      service.getCurrentUser().subscribe(res => (user = res));
      tick();

      expect(user).toBeNull();
    }));

    it('should return user when authenticated', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };
      service.login(credentials).subscribe();
      tick(500);

      let user: User | null = null;
      service.getCurrentUser().subscribe(res => (user = res));
      tick();

      expect(user).toBeTruthy();
      expect(user!.email).toBe(VALID_EMAIL);
    }));
  });

  describe('isAuthenticated', () => {
    it('should return false when not logged in', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when logged in', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };
      service.login(credentials).subscribe();
      tick(500);

      expect(service.isAuthenticated()).toBe(true);
    }));
  });

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return token when authenticated', fakeAsync(() => {
      const credentials: LoginDto = {
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      };
      service.login(credentials).subscribe();
      tick(500);

      const token = service.getAccessToken();
      expect(token).toBeTruthy();
      expect(token).toContain('mock-jwt-');
    }));
  });

  describe('restoreSession', () => {
    it('should restore session from localStorage', () => {
      const mockUser: User = {
        id: 1,
        email: VALID_EMAIL,
        firstName: 'Test',
        lastName: 'User',
        role: 'commercial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = 'mock-jwt-restored';

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      // Create a new instance to trigger restoreSession in constructor
      const newService = new AuthMockService();

      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getAccessToken()).toBe(mockToken);
    });

    it('should not restore session if localStorage is empty', () => {
      const newService = new AuthMockService();

      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.getAccessToken()).toBeNull();
    });

    it('should clear invalid stored data', () => {
      localStorage.setItem(TOKEN_KEY, 'some-token');
      localStorage.setItem(USER_KEY, 'invalid-json{{{');

      const newService = new AuthMockService();

      expect(newService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });
});
