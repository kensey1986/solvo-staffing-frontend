/**
 * Auth API Service Tests
 *
 * Unit tests for AuthApiService HTTP interactions.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthApiService } from './auth-api.service';
import { ENV } from '../../config/env.config';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { User } from '../../models/user.model';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/api';
  const apiVersion = 'v1';
  const apiUrl = `${baseUrl}/${apiVersion}`;
  const TOKEN_KEY = 'solvo_token';
  const USER_KEY = 'solvo_user';

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'commercial',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
    ENV.apiBaseUrl = baseUrl;
    ENV.apiVersion = apiVersion;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthApiService],
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponseDto = {
        user: mockUser,
        accessToken: 'jwt-token-123',
      };

      service.login(credentials).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should store token and user in localStorage on successful login', () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponseDto = {
        user: mockUser,
        accessToken: 'jwt-token-123',
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token-123');
      expect(JSON.parse(localStorage.getItem(USER_KEY)!)).toEqual(mockUser);
    });

    it('should set isAuthenticated to true after successful login', () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponseDto = {
        user: mockUser,
        accessToken: 'jwt-token-123',
      };

      expect(service.isAuthenticated()).toBe(false);

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should send POST request to logout endpoint', () => {
      // First set up authenticated state
      localStorage.setItem(TOKEN_KEY, 'test-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      service.logout().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should clear localStorage on logout', () => {
      localStorage.setItem(TOKEN_KEY, 'test-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      service.logout().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      req.flush(null);

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('should clear localStorage even if logout request fails', () => {
      localStorage.setItem(TOKEN_KEY, 'test-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      service.logout().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      req.error(new ProgressEvent('error'));

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', done => {
      service.getCurrentUser().subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should return user when authenticated', done => {
      // Set up authenticated state
      localStorage.setItem(TOKEN_KEY, 'test-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      // Create new instance to trigger restoreSession
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthApiService],
      });
      const newService = TestBed.inject(AuthApiService);

      newService.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not logged in', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after successful login', () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponseDto = {
        user: mockUser,
        accessToken: 'jwt-token-123',
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return token after successful login', () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: LoginResponseDto = {
        user: mockUser,
        accessToken: 'jwt-token-123',
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(service.getAccessToken()).toBe('jwt-token-123');
    });
  });

  describe('restoreSession', () => {
    it('should restore session from localStorage on initialization', () => {
      localStorage.setItem(TOKEN_KEY, 'restored-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

      // Create new instance to trigger restoreSession
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthApiService],
      });
      const newService = TestBed.inject(AuthApiService);

      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getAccessToken()).toBe('restored-token');
    });

    it('should not restore session if localStorage is empty', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthApiService],
      });
      const newService = TestBed.inject(AuthApiService);

      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.getAccessToken()).toBeNull();
    });
  });
});
