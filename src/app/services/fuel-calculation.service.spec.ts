import { TestBed } from '@angular/core/testing';
import { FuelCalculationService } from './fuel-calculation.service';
import { FuelCalculation } from '../models/fuel.models';

describe('FuelCalculationService', () => {
  let service: FuelCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuelCalculationService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculate', () => {
    it('should calculate fuel cost correctly', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 1,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result).toBeTruthy();
      expect(result?.litersConsumed).toBe(8);
      expect(result?.totalCost).toBe(12);
      expect(result?.costPerPerson).toBe(12);
    });

    it('should split cost per passenger', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 4,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result?.totalCost).toBe(12);
      expect(result?.costPerPerson).toBe(3);
    });

    it('should return null for invalid data (zero kilometers)', () => {
      const data: FuelCalculation = {
        kilometers: 0,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 1,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result).toBeNull();
    });

    it('should return null for invalid data (zero consumption)', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 0,
        fuelPrice: 1.5,
        passengers: 1,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result).toBeNull();
    });

    it('should return null for invalid data (zero price)', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 0,
        passengers: 1,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result).toBeNull();
    });

    it('should return null for invalid data (zero passengers)', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 0,
        fuelType: 'gasoline',
      };

      const result = service.calculate(data);

      expect(result).toBeNull();
    });

    it('should handle decimal values correctly', () => {
      const data: FuelCalculation = {
        kilometers: 250.5,
        averageConsumption: 7.8,
        fuelPrice: 1.459,
        passengers: 2,
        fuelType: 'diesel',
      };

      const result = service.calculate(data);

      const expectedLiters = (250.5 * 7.8) / 100;
      const expectedTotal = expectedLiters * 1.459;
      const expectedPerPerson = expectedTotal / 2;

      expect(result?.litersConsumed).toBeCloseTo(expectedLiters, 3);
      expect(result?.totalCost).toBeCloseTo(expectedTotal, 3);
      expect(result?.costPerPerson).toBeCloseTo(expectedPerPerson, 3);
    });
  });

  describe('validateInput', () => {
    it('should return true for valid input', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 2,
        fuelType: 'gasoline',
      };

      expect(service.validateInput(data)).toBeTrue();
    });

    it('should return false for zero kilometers', () => {
      const data: FuelCalculation = {
        kilometers: 0,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 2,
        fuelType: 'gasoline',
      };

      expect(service.validateInput(data)).toBeFalse();
    });

    it('should return false for negative values', () => {
      const data: FuelCalculation = {
        kilometers: -100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 2,
        fuelType: 'gasoline',
      };

      expect(service.validateInput(data)).toBeFalse();
    });
  });

  describe('getValidationErrors', () => {
    it('should return empty array for valid data', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 2,
        fuelType: 'gasoline',
      };

      const errors = service.getValidationErrors(data);

      expect(errors.length).toBe(0);
    });

    it('should return errors for invalid data', () => {
      const data: FuelCalculation = {
        kilometers: 0,
        averageConsumption: 0,
        fuelPrice: 0,
        passengers: 0,
        fuelType: 'gasoline',
      };

      const errors = service.getValidationErrors(data);

      expect(errors.length).toBe(4);
      expect(errors[0]).toContain('kilómetros');
    });
  });

  describe('getFuelTypes', () => {
    it('should return list of fuel types', () => {
      const fuelTypes = service.getFuelTypes();

      expect(fuelTypes.length).toBe(4);
      expect(fuelTypes[0].id).toBe('gasoline');
      expect(fuelTypes[1].id).toBe('diesel');
      expect(fuelTypes[2].id).toBe('electric');
      expect(fuelTypes[3].id).toBe('lpg');
    });
  });

  describe('history', () => {
    it('should save calculation to history', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 1,
        fuelType: 'gasoline',
      };

      service.calculate(data);

      const history = service.getHistory();
      expect(history.length).toBe(1);
    });

    it('should clear history', () => {
      const data: FuelCalculation = {
        kilometers: 100,
        averageConsumption: 8,
        fuelPrice: 1.5,
        passengers: 1,
        fuelType: 'gasoline',
      };

      service.calculate(data);
      service.clearHistory();

      const history = service.getHistory();
      expect(history.length).toBe(0);
    });
  });
});
