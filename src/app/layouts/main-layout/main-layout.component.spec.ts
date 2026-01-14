import { jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { ThemeService } from '@core/services/theme.service';
import { signal, PLATFORM_ID } from '@angular/core';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockBreakpointObserver: { observe: jest.Mock };
  let mockThemeService: Partial<ThemeService>;

  beforeEach(async () => {
    mockBreakpointObserver = {
      observe: jest.fn().mockReturnValue(of({ matches: false, breakpoints: {} })),
    };

    mockThemeService = {
      theme: signal('light'),
      toggleTheme: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial sidenavOpened as false', () => {
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should toggle sidenavOpened', () => {
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(true);
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should have default navItems', () => {
    expect(component.navItems.length).toBeGreaterThan(0);
    expect(component.navItems[0].label).toBe('Dashboard');
  });

  it('should close sidenav on nav item click if mobile', () => {
    // Force mobile state
    // Note: Since toSignal is used with breakpointObserver, we need to mock the observer return value before component creation
    // or use a more advanced mocking strategy for signals if possible.
    // However, we can also just call the method and check the logic if we can mock isMobile.

    // Let's re-create with mobile observer
    mockBreakpointObserver.observe.mockReturnValue(
      of({ matches: true, breakpoints: { [Breakpoints.Handset]: true } })
    );
    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.sidenavOpened.set(true);
    component.onNavItemClick();
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should NOT close sidenav on nav item click if NOT mobile', () => {
    mockBreakpointObserver.observe.mockReturnValue(of({ matches: false, breakpoints: {} }));
    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.sidenavOpened.set(true);
    component.onNavItemClick();
    expect(component.sidenavOpened()).toBe(true);
  });
});
