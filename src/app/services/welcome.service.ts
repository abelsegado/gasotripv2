import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WelcomeService {
  private readonly STORAGE_KEY = 'gasotrip_welcome_shown';

  isFirstVisit(): boolean {
    return !localStorage.getItem(this.STORAGE_KEY);
  }

  markWelcomeShown(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  resetWelcome(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
