import { Injectable } from '@angular/core';
import { AppSettingsService } from './app-settings.service';

@Injectable({
  providedIn: 'root',
})
export class FuelPriceService {
  constructor(private settingsService: AppSettingsService) {}

  getCurrentPrice(fuelType: string): number {
    return this.settingsService.getDefaultPriceForFuel(fuelType);
  }
}
