import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { PLATFORM_ID, signal } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { jest } from '@jest/globals';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ThemeService, useValue: { theme: signal('light'), toggleTheme: jest.fn() } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
