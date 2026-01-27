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
    location: 'Florida',
    department: 'Engineering',
    seniorityLevel: 'senior',
    workModality: 'remote',
    isRemoteViable: true,
    status: 'active',
    pipelineStage: 'contacted',
    source: 'indeed',
    jobUrl: 'https://indeed.com/job/123',
    publishedDate: '2025-12-13',
    description: 'Test description',
    salaryRange: '$120,000 - $160,000',
    notes: 'Test notes',
  };

  // Mock window.confirm
  const originalConfirm = window.confirm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVacancyModalComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditVacancyModalComponent);
    component = fixture.componentInstance;

    // Always confirm close dialogs in tests
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
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
    expect(component.formData.description).toBe('Test description');
    expect(component.formData.location).toBe('Florida');
    expect(component.formData.department).toBe('Engineering');
    expect(component.formData.seniorityLevel).toBe('senior');
    expect(component.formData.workModality).toBe('remote');
    expect(component.formData.isRemoteViable).toBe(true);
    expect(component.formData.salaryMin).toBe(120000);
    expect(component.formData.salaryMax).toBe(160000);
    expect(component.formData.source).toBe('indeed');
    expect(component.formData.jobUrl).toBe('https://indeed.com/job/123');
    expect(component.formData.notes).toBe('Test notes');
  });

  it('should reset form to defaults when opened without vacancy', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', null);
    fixture.detectChanges();

    expect(component.formData.jobTitle).toBe('');
    expect(component.formData.description).toBe('');
    expect(component.formData.location).toBe('');
    expect(component.formData.department).toBe('');
    expect(component.formData.seniorityLevel).toBe('');
    expect(component.formData.workModality).toBe('');
    expect(component.formData.isRemoteViable).toBe(false);
    expect(component.formData.salaryMin).toBeNull();
    expect(component.formData.salaryMax).toBeNull();
    expect(component.formData.source).toBe('');
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
        department: 'Engineering',
        seniorityLevel: 'senior',
        workModality: 'remote',
        isRemoteViable: true,
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

  it('should provide seniority options', () => {
    const options = component.seniorityOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(o => o.value === 'senior')).toBe(true);
    expect(options.some(o => o.value === 'mid_level')).toBe(true);
  });

  it('should provide modality options', () => {
    const options = component.modalityOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(o => o.value === 'remote')).toBe(true);
    expect(options.some(o => o.value === 'hybrid')).toBe(true);
    expect(options.some(o => o.value === 'on_site')).toBe(true);
  });

  it('should provide source options', () => {
    const options = component.sourceOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(o => o.value === 'indeed')).toBe(true);
    expect(options.some(o => o.value === 'linkedin')).toBe(true);
  });

  it('should track modified fields count', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    // Initially no changes
    expect(component.modifiedFieldsCount()).toBe(0);

    // Modify a field
    component.formData.jobTitle = 'New Title';
    component.onFieldChange();

    expect(component.modifiedFieldsCount()).toBe(1);
    expect(component.isFieldModified('jobTitle')).toBe(true);
  });

  it('should detect unsaved changes', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    expect(component.hasUnsavedChanges()).toBe(false);

    component.formData.notes = 'Updated notes';
    component.onFieldChange();

    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('should parse salary range to min/max values', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('vacancy', mockVacancy);
    fixture.detectChanges();

    expect(component.formData.salaryMin).toBe(120000);
    expect(component.formData.salaryMax).toBe(160000);
  });

  it('should provide department options', () => {
    expect(component.departmentOptions.length).toBeGreaterThan(0);
    expect(component.departmentOptions).toContain('Engineering');
    expect(component.departmentOptions).toContain('Sales');
  });

  it('should provide US states for location datalist', () => {
    expect(component.usStates.length).toBeGreaterThan(0);
    expect(component.usStates).toContain('Florida');
    expect(component.usStates).toContain('California');
    expect(component.usStates).toContain('Remote');
  });
});
