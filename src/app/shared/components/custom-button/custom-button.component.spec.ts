import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomButtonComponent, ButtonVariant, ButtonSize } from './custom-button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomButtonComponent', () => {
  let component: CustomButtonComponent;
  let fixture: ComponentFixture<CustomButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomButtonComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Test Button');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Input signals', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Test Button');
    });

    it('should have default variant as primary', () => {
      fixture.detectChanges();
      expect(component.variant()).toBe('primary');
    });

    it('should have default size as medium', () => {
      fixture.detectChanges();
      expect(component.size()).toBe('medium');
    });

    it('should accept different variants', () => {
      const variants: ButtonVariant[] = ['primary', 'secondary', 'warn', 'text'];

      variants.forEach(variant => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(component.variant()).toBe(variant);
      });
    });

    it('should accept different sizes', () => {
      const sizes: ButtonSize[] = ['small', 'medium', 'large'];

      sizes.forEach(size => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(component.size()).toBe(size);
      });
    });

    it('should accept disabled state', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('should accept loading state', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.loading()).toBe(true);
    });
  });

  describe('Click events', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Test Button');
      fixture.detectChanges();
    });

    it('should emit buttonClick when clicked and not disabled', () => {
      const spy = jest.fn();
      component.buttonClick.subscribe(spy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should not emit buttonClick when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const spy = jest.fn();
      component.buttonClick.subscribe(spy);

      component.onClick(new MouseEvent('click'));

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit buttonClick when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spy = jest.fn();
      component.buttonClick.subscribe(spy);

      component.onClick(new MouseEvent('click'));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Test Button');
      fixture.detectChanges();
    });

    it('should set aria-busy when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-busy')).toBe('true');
    });

    it('should set aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Test Button');
    });

    it('should display the label', () => {
      fixture.detectChanges();
      const labelElement = fixture.nativeElement.querySelector('.custom-button__label');
      expect(labelElement.textContent.trim()).toBe('Test Button');
    });

    it('should display icon when provided', () => {
      fixture.componentRef.setInput('icon', 'add');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement.textContent.trim()).toBe('add');
    });

    it('should display loading spinner when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should apply full-width class when fullWidth is true', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('custom-button--full-width')).toBe(true);
    });
  });
});
