import { Injectable } from '@angular/core';
import { FuelCalculation, CalculationResult, FUEL_TYPES, ValidationErrorCode } from '../models/fuel.models';

const STORAGE_KEY = 'gasotrip_history';
const FAVORITES_KEY = 'gasotrip_favorites';

@Injectable({
  providedIn: 'root',
})
export class FuelCalculationService {
  private history: FuelCalculation[] = [];
  private favorites: FuelCalculation[] = [];

  constructor() {
    this.loadHistory();
    this.loadFavorites();
  }

  calculate(data: FuelCalculation): CalculationResult | null {
    if (!this.validateInput(data)) {
      return null;
    }

    const litersConsumed = (data.kilometers * data.averageConsumption) / 100;
    const totalCost = litersConsumed * data.fuelPrice;
    const costPerPerson = data.passengers > 0 ? totalCost / data.passengers : totalCost;
    const savingsPerPerson = data.passengers > 1 ? totalCost - costPerPerson : 0;

    const result: CalculationResult = {
      litersConsumed,
      totalCost,
      costPerPerson,
      savingsPerPerson,
    };

    const calculation: FuelCalculation = {
      ...data,
      result,
      timestamp: Date.now(),
    };

    this.addToHistory(calculation);

    return result;
  }

  validateInput(data: FuelCalculation): boolean {
    return (
      data.kilometers > 0 &&
      data.averageConsumption > 0 &&
      data.fuelPrice > 0 &&
      data.passengers > 0
    );
  }

  getValidationErrors(data: FuelCalculation): ValidationErrorCode[] {
    const errors: ValidationErrorCode[] = [];

    if (data.kilometers <= 0) {
      errors.push('kilometersMin');
    }
    if (data.averageConsumption <= 0) {
      errors.push('consumptionMin');
    }
    if (data.fuelPrice <= 0) {
      errors.push('priceMin');
    }
    if (data.passengers <= 0) {
      errors.push('passengersMin');
    }

    return errors;
  }

  getFuelTypes() {
    return FUEL_TYPES;
  }

  getHistory(): FuelCalculation[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  getFavorites(): FuelCalculation[] {
    return [...this.favorites];
  }

  addFavorite(calculation: FuelCalculation): void {
    const exists = this.favorites.some(
      f => f.kilometers === calculation.kilometers &&
           f.averageConsumption === calculation.averageConsumption &&
           f.fuelPrice === calculation.fuelPrice &&
           f.passengers === calculation.passengers &&
           f.fuelType === calculation.fuelType
    );

    if (!exists) {
      this.favorites.unshift({
        ...calculation,
        timestamp: Date.now(),
      });
      this.saveFavorites();
    }
  }

  removeFavorite(timestamp: number): void {
    this.favorites = this.favorites.filter(f => f.timestamp !== timestamp);
    this.saveFavorites();
  }

  isFavorite(calculation: FuelCalculation): boolean {
    return this.favorites.some(
      f => f.kilometers === calculation.kilometers &&
           f.averageConsumption === calculation.averageConsumption &&
           f.fuelPrice === calculation.fuelPrice &&
           f.passengers === calculation.passengers &&
           f.fuelType === calculation.fuelType
    );
  }

  clearFavorites(): void {
    this.favorites = [];
    this.saveFavorites();
  }

  updateHistoryItem(timestamp: number, updates: Partial<FuelCalculation>): void {
    const idx = this.history.findIndex(h => h.timestamp === timestamp);
    if (idx >= 0) {
      const updated: FuelCalculation = { ...this.history[idx], ...updates };
      // Recalculate result with updated values
      const newResult = this.calculate({
        ...updated,
      });
      if (newResult) {
        // Remove last auto-added history entry (calculate() adds it)
        this.history.shift();
        updated.result = newResult;
        updated.timestamp = timestamp; // keep original timestamp
        this.history[idx] = updated;
        this.saveHistory();
      }
    }
  }

  private addToHistory(calculation: FuelCalculation): void {
    this.history.unshift(calculation);
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    this.saveHistory();
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        this.favorites = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
  }

  private saveFavorites(): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }
}
