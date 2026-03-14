import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1Page } from './tab1.page';
import { FuelCalculationService } from '../services/fuel-calculation.service';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tab1Page],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule],
      providers: [FuelCalculationService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.kilometers).toBeNull();
    expect(component.averageConsumption).toBeNull();
    expect(component.fuelPrice).toBeNull();
    expect(component.passengers).toBe(1);
    expect(component.selectedFuelType).toBe('gasoline');
    expect(component.showResult).toBeFalse();
  });

  it('should show validation error when fields are empty', () => {
    component.calculate();
    expect(component.validationErrors.length).toBeGreaterThan(0);
  });

  it('should calculate correctly with valid data', (done) => {
    component.kilometers = 100;
    component.averageConsumption = 8;
    component.fuelPrice = 1.5;
    component.passengers = 1;

    component.calculate();

    setTimeout(() => {
      expect(component.result).toBeTruthy();
      expect(component.result?.totalCost).toBe(12);
      expect(component.showResult).toBeTrue();
      done();
    }, 500);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(12.5);
    expect(formatted).toBe('12,50 €');
  });

  it('should format liters correctly', () => {
    const formatted = component.formatLiters(8.5);
    expect(formatted).toBe('8,50 L');
  });

  it('should clear form', () => {
    component.kilometers = 100;
    component.averageConsumption = 8;
    component.fuelPrice = 1.5;
    component.result = { litersConsumed: 8, totalCost: 12, costPerPerson: 12 };
    component.showResult = true;

    component.clearForm();

    expect(component.kilometers).toBeNull();
    expect(component.averageConsumption).toBeNull();
    expect(component.fuelPrice).toBeNull();
    expect(component.passengers).toBe(1);
    expect(component.result).toBeNull();
    expect(component.showResult).toBeFalse();
  });
});
