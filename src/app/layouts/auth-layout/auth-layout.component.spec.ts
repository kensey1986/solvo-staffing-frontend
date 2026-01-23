import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLayoutComponent } from './auth-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { jest } from '@jest/globals';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;
  let mockThemeService: Partial<ThemeService>;

  beforeEach(async () => {
    mockThemeService = {
      theme: signal('light'),
      toggleTheme: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent, RouterTestingModule],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should render router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
