import { Injectable } from '@angular/core';
import { Language } from './i18n.service';
import { DEFAULT_FUEL_PRICES } from '../models/fuel.models';

export type DistanceUnit = 'km' | 'mi';
export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  distanceUnit: DistanceUnit;
  theme: ThemeMode;
  fuelPrices: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private static STORAGE_KEY = 'gasotrip_settings';
  private settings: AppSettings = {
    language: 'es',
    distanceUnit: 'km',
    theme: 'light',
    fuelPrices: { ...DEFAULT_FUEL_PRICES },
  };

  constructor() {
    this.load();
  }

  getSettings(): AppSettings {
    return { ...this.settings, fuelPrices: { ...this.settings.fuelPrices } };
  }

  updateSettings(partial: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.save();
  }

  getDefaultPriceForFuel(fuelType: string): number {
    return this.settings.fuelPrices[fuelType] ?? DEFAULT_FUEL_PRICES[fuelType] ?? 1.60;
  }

  resetFuelPrices(): void {
    this.settings.fuelPrices = { ...DEFAULT_FUEL_PRICES };
    this.save();
  }

  private load(): void {
    try {
      const s = localStorage.getItem(AppSettingsService.STORAGE_KEY);
      if (s) {
        const parsed = JSON.parse(s) as Partial<AppSettings>;
        this.settings = {
          ...this.settings,
          ...parsed,
          fuelPrices: { ...DEFAULT_FUEL_PRICES, ...(parsed.fuelPrices ?? {}) },
        };
      }
    } catch {
      // ignore
    }
  }

  private save(): void {
    try {
      localStorage.setItem(AppSettingsService.STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }
}
