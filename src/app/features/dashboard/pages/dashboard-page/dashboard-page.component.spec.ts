import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { KpiCardComponent } from '@shared';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DASHBOARD_SERVICE } from '@core';
import { of } from 'rxjs';
import { DashboardData } from '@core/models/dashboard.model';

// Mock dashboard data
const mockDashboardData: DashboardData = {
  vacancyKpis: [
    { label: 'Detectadas', value: '2,847', icon: 'schedule', color: 'purple' },
    { label: 'Contactadas', value: '423', icon: 'phone', color: 'blue' },
    { label: 'Propuesta', value: '256', icon: 'description', color: 'orange' },
    { label: 'Ganadas', value: '89', icon: 'check_circle', color: 'green' },
    { label: 'Perdidas', value: '156', icon: 'cancel', color: 'orange' },
  ],
  companyKpis: [
    { label: 'Leads', value: '156', icon: 'group_add', color: 'purple' },
    { label: 'Prospecting', value: '87', icon: 'search', color: 'blue' },
    { label: 'Engaged', value: '54', icon: 'handshake', color: 'blue' },
    { label: 'Appt Held', value: '32', icon: 'event', color: 'orange' },
    { label: 'Client', value: '23', icon: 'business', color: 'green' },
  ],
};

// Mock service
const mockDashboardService = {
  getDashboardData: jest.fn().mockReturnValue(of(mockDashboardData)),
};

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent, KpiCardComponent, NoopAnimationsModule],
    })
      .overrideComponent(DashboardPageComponent, {
        set: {
          providers: [{ provide: DASHBOARD_SERVICE, useValue: mockDashboardService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render vacancy pipeline section', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard-page__section-title')?.textContent).toContain(
      'Pipeline de Vacantes'
    );
  }));

  it('should render 10 KPI cards (5 for vacancies, 5 for companies)', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-kpi-card');
    expect(cards.length).toBe(10);
  }));

  it('should load dashboard data on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockDashboardService.getDashboardData).toHaveBeenCalled();
    expect(component.dashboardData()).toEqual(mockDashboardData);
    expect(component.isLoading()).toBe(false);
  }));

  it('should set lastUpdated after successful load', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.lastUpdated()).not.toBeNull();
  }));
});
