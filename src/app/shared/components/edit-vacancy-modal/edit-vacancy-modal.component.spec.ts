import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EditVacancyModalComponent } from './edit-vacancy-modal.component';
import { Vacancy } from '@core';

describe('EditVacancyModalComponent', () => {
  let component: EditVacancyModalComponent;
  let fixture: ComponentFixture<EditVacancyModalComponent>;

  const mockVacancy: Vacancy = {
    id: 1,
    jobTitle: 'Senior Software Engineer',
    companyId: 1,
    companyName: 'TechCorp Solutions',
    location: 'Miami, FL',
    department: 'Engineering',
    seniorityLevel: 'senior',
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    publishedDate: '2025-12-13',
    salaryRange: '$120,000 - $160,000',
    notes: 'Test notes',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVacancyModalComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditVacancyModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should populate form with vacancy data when opened', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    expect(component.formData.jobTitle).toBe('Senior Software Engineer');
    expect(component.formData.status).toBe('active');
    expect(component.formData.department).toBe('Engineering');
    expect(component.formData.seniorityLevel).toBe('senior');
    expect(component.formData.salaryRange).toBe('$120,000 - $160,000');
    expect(component.formData.notes).toBe('Test notes');
  });

  it('should reset form to defaults when opened without vacancy', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', null);
    fixture.detectChanges();

    expect(component.formData.jobTitle).toBe('');
    expect(component.formData.department).toBe('');
    expect(component.formData.seniorityLevel).toBe('');
    expect(component.formData.salaryRange).toBe('');
    expect(component.formData.notes).toBe('');
  });

  it('should emit closeModal when close is called', () => {
    const closeSpy = jest.fn();
    component.closeModal.subscribe(closeSpy);
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit submitEdit with form data when submit is called', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    const submitSpy = jest.fn();
    component.submitEdit.subscribe(submitSpy);
    component.submit();

    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        jobTitle: 'Senior Software Engineer',
        status: 'active',
        department: 'Engineering',
        seniorityLevel: 'senior',
      })
    );
  });

  it('should not emit submitEdit when form is invalid', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', { ...mockVacancy, jobTitle: '   ' });
    fixture.detectChanges();

    const submitSpy = jest.fn();
    component.submitEdit.subscribe(submitSpy);

    component.submit();

    expect(component.isValid()).toBe(false);
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should not submit when jobTitle is empty', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', { ...mockVacancy, jobTitle: '' });
    fixture.detectChanges();

    component.formData.jobTitle = '';
    component.validateForm();

    expect(component.isValid()).toBe(false);
  });

  it('should be valid when jobTitle is provided', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    expect(component.isValid()).toBe(true);
  });

  it('should emit closeModal when overlay is clicked and closeOnOverlay is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.componentRef.setInput('closeOnOverlay', true);
    fixture.detectChanges();

    const closeSpy = jest.fn();
    component.closeModal.subscribe(closeSpy);
    component.onOverlayClick();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should not emit closeModal when overlay is clicked and closeOnOverlay is false', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.componentRef.setInput('closeOnOverlay', false);
    fixture.detectChanges();

    const closeSpy = jest.fn();
    component.closeModal.subscribe(closeSpy);
    component.onOverlayClick();

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should provide status options', () => {
    const options = component.statusOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(o => o.value === 'active')).toBe(true);
    expect(options.some(o => o.value === 'filled')).toBe(true);
    expect(options.some(o => o.value === 'expired')).toBe(true);
  });

  it('should provide seniority options', () => {
    const options = component.seniorityOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(o => o.value === 'senior')).toBe(true);
    expect(options.some(o => o.value === 'mid_level')).toBe(true);
  });
});
