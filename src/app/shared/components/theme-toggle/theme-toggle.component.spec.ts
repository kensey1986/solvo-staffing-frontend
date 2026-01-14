import { jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '@core/services/theme.service';
import { signal, WritableSignal, PLATFORM_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let mockThemeService: Partial<ThemeService>;
  let themeSignal: WritableSignal<'light' | 'dark'>;

  beforeEach(async () => {
    themeSignal = signal('light');
    mockThemeService = {
      theme: themeSignal,
      toggleTheme: jest.fn(() => {
        themeSignal.set(themeSignal() === 'light' ? 'dark' : 'light');
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent, NoopAnimationsModule],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show dark_mode icon when theme is light', () => {
    themeSignal.set('light');
    fixture.detectChanges();
    expect(component.iconName()).toBe('dark_mode');
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent.trim()).toBe('dark_mode');
  });

  it('should show light_mode icon when theme is dark', () => {
    themeSignal.set('dark');
    fixture.detectChanges();
    expect(component.iconName()).toBe('light_mode');
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent.trim()).toBe('light_mode');
  });

  it('should show correct tooltip when theme is light', () => {
    themeSignal.set('light');
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('Switch to dark mode');
  });

  it('should show correct tooltip when theme is dark', () => {
    themeSignal.set('dark');
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('Switch to light mode');
  });

  it('should call toggleTheme on click', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });
});
