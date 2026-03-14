import { Injectable } from '@angular/core';
import { CalculationResult, FuelCalculation } from '../models/fuel.models';

export interface SavedTrip {
  id: string;
  kilometers: number;
  averageConsumption: number;
  fuelPrice: number;
  passengers: number;
  fuelType: string;
  timestamp: number;
  result?: CalculationResult;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private static PROFILE_KEY = 'gasotrip_user_profile';
  private profile: any = {
    id: 'user-1',
    name: 'Usuario',
    email: '',
    trips: [] as SavedTrip[],
  };

  constructor() {
    this.load();
  }

  getProfile(): any {
    return this.profile;
  }

  updateProfile(partial: Partial<any>): void {
    this.profile = { ...this.profile, ...partial };
    this.save();
  }

  getTrips(): SavedTrip[] {
    return [...(this.profile.trips || [])];
  }

  addTrip(trip: SavedTrip): void {
    this.profile.trips = [trip, ...(this.profile.trips || [])];
    this.save();
  }

  updateTrip(id: string, updates: Partial<SavedTrip>): void {
    if (!this.profile.trips) return;
    const idx = this.profile.trips.findIndex((t: SavedTrip) => t.id === id);
    if (idx >= 0) {
      this.profile.trips[idx] = { ...this.profile.trips[idx], ...updates } as SavedTrip;
      this.save();
    }
  }

  private load(): void {
    try {
      const s = localStorage.getItem(UserService.PROFILE_KEY);
      if (s) this.profile = JSON.parse(s);
    } catch {
      // ignore
    }
  }

  private save(): void {
    try {
      localStorage.setItem(UserService.PROFILE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore
    }
  }
}
