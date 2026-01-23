import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsShowcasePageComponent } from './components-showcase-page.component';

describe('ComponentsShowcasePageComponent', () => {
  let component: ComponentsShowcasePageComponent;
  let fixture: ComponentFixture<ComponentsShowcasePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsShowcasePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsShowcasePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.components-showcase-page__title')?.textContent).toContain(
      'Componentes'
    );
  });
});
