import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginPageComponent } from './login-page.component';
import { AUTH_SERVICE_PROVIDER } from '@core';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [AUTH_SERVICE_PROVIDER],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    expect(component.loginForm.contains('email')).toBeTruthy();
    expect(component.loginForm.contains('password')).toBeTruthy();
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(component.getEmailErrorMessage()).toBe('Email is required');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(component.getEmailErrorMessage()).toBe('Please enter a valid email address');

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(component.getPasswordErrorMessage()).toBe('Password is required');

    passwordControl?.setValue('123');
    expect(passwordControl?.valid).toBeFalsy();
    expect(component.getPasswordErrorMessage()).toBe('Password must be at least 6 characters');

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBeFalsy();
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBeTruthy();
  });

  it('should mark form group as touched when submitting invalid form', () => {
    const spy = jest.spyOn(component.loginForm, 'markAsTouched');
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });
});
