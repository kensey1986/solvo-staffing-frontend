import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomCardComponent, CardElevation } from './custom-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomCardComponent', () => {
  let component: CustomCardComponent;
  let fixture: ComponentFixture<CustomCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Input signals', () => {
    it('should have default elevation as raised', () => {
      fixture.detectChanges();
      expect(component.elevation()).toBe('raised');
    });

    it('should accept different elevations', () => {
      const elevations: CardElevation[] = ['flat', 'raised', 'elevated'];

      elevations.forEach(elevation => {
        fixture.componentRef.setInput('elevation', elevation);
        fixture.detectChanges();
        expect(component.elevation()).toBe(elevation);
      });
    });

    it('should accept title', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();
      expect(component.title()).toBe('Test Title');
    });

    it('should accept subtitle', () => {
      fixture.componentRef.setInput('subtitle', 'Test Subtitle');
      fixture.detectChanges();
      expect(component.subtitle()).toBe('Test Subtitle');
    });

    it('should accept clickable state', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();
      expect(component.clickable()).toBe(true);
    });

    it('should accept selected state', () => {
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.selected()).toBe(true);
    });
  });

  describe('Click events', () => {
    it('should emit cardClick when clickable and clicked', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const spy = jest.fn();
      component.cardClick.subscribe(spy);

      component.onClick(new MouseEvent('click'));

      expect(spy).toHaveBeenCalled();
    });

    it('should not emit cardClick when not clickable', () => {
      fixture.componentRef.setInput('clickable', false);
      fixture.detectChanges();

      const spy = jest.fn();
      component.cardClick.subscribe(spy);

      component.onClick(new MouseEvent('click'));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();
    });

    it('should emit cardClick on Enter key', () => {
      const spy = jest.fn();
      component.cardClick.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      component.onKeydown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit cardClick on Space key', () => {
      const spy = jest.fn();
      component.cardClick.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      component.onKeydown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should not emit on other keys', () => {
      const spy = jest.fn();
      component.cardClick.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeydown(event);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should display title when provided', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('mat-card-title');
      expect(titleElement.textContent.trim()).toBe('Test Title');
    });

    it('should display subtitle when provided', () => {
      fixture.componentRef.setInput('subtitle', 'Test Subtitle');
      fixture.detectChanges();

      const subtitleElement = fixture.nativeElement.querySelector('mat-card-subtitle');
      expect(subtitleElement.textContent.trim()).toBe('Test Subtitle');
    });

    it('should display icon when provided', () => {
      fixture.componentRef.setInput('icon', 'dashboard');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement.textContent.trim()).toBe('dashboard');
    });

    it('should apply clickable class when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.classList.contains('custom-card--clickable')).toBe(true);
    });

    it('should set tabindex when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('should set role button when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('role')).toBe('button');
    });
  });
});
