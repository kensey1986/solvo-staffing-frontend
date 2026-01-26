import { jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { CustomCardComponent } from '@shared/components/custom-card/custom-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID } from '@angular/core';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardPageComponent,
        CustomButtonComponent,
        CustomCardComponent,
        NoopAnimationsModule,
      ],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have methods to handle clicks', () => {
    const primarySpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const secondarySpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const cardSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    component.onPrimaryClick();
    expect(primarySpy).toHaveBeenCalledWith('Primary button clicked!');

    component.onSecondaryClick();
    expect(secondarySpy).toHaveBeenCalledWith('Secondary button clicked!');

    component.onCardClick();
    expect(cardSpy).toHaveBeenCalledWith('Card clicked!');

    primarySpy.mockRestore();
    secondarySpy.mockRestore();
    cardSpy.mockRestore();
  });
});
