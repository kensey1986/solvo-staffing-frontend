import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { MatIconModule } from '@angular/material/icon';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('value', '123');
    fixture.componentRef.setInput('icon', 'work');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kpi-card__label')?.textContent).toContain('Test Label');
    expect(compiled.querySelector('.kpi-card__value')?.textContent).toContain('123');
  });

  it('should apply icon color class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('iconColor', 'blue');
    fixture.detectChanges();
    expect(compiled.querySelector('.kpi-card__icon')?.classList).toContain('kpi-card__icon--blue');
  });
});
