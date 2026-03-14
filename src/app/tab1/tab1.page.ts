import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { FuelCalculation, CalculationResult, FuelType, FUEL_TYPES } from '../models/fuel.models';
import { FuelCalculationService } from '../services/fuel-calculation.service';
import { ThemeService } from '../services/theme.service';
import { I18nService, Language, Translations } from '../services/i18n.service';
import { FuelPriceService } from '../services/fuel-price.service';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  kilometers: number | null = null;
  averageConsumption: number | null = null;
  fuelPrice: number | null = null;
  passengers: number = 1;
  selectedFuelType: string = 'gasoline';
  tripName: string = '';

  result: CalculationResult | null = null;
  validationErrors: Record<string, string> = {};
  showResult = false;
  isCalculating = false;
  isDarkMode = false;
  isFavorite = false;

  fuelTypes: FuelType[] = FUEL_TYPES;
  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  private inputChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  private fuelService = inject(FuelCalculationService);
  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);
  private priceService = inject(FuelPriceService);
  private toastCtrl = inject(ToastController);

  constructor() {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);

    // Load default price for initial fuel type
    this.fuelPrice = this.priceService.getCurrentPrice(this.selectedFuelType);

    // Real-time calculation with debounce
    this.inputChange$
      .pipe(debounceTime(600), takeUntil(this.destroy$))
      .subscribe(() => this.tryAutoCalculate());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter(): void {
    // Refresh language in case it changed from settings
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';

    this.checkLoadTrip();
  }

  private checkLoadTrip(): void {
    const saved = sessionStorage.getItem('gasotrip_load_trip');
    if (saved) {
      try {
        const trip = JSON.parse(saved) as FuelCalculation;
        this.kilometers = trip.kilometers;
        this.averageConsumption = trip.averageConsumption;
        this.fuelPrice = trip.fuelPrice;
        this.passengers = trip.passengers;
        this.selectedFuelType = trip.fuelType;
        this.tripName = trip.tripName || '';
        
        sessionStorage.removeItem('gasotrip_load_trip');
        this.performCalculation(false);
      } catch (e) {
        console.error('Error loading trip from session', e);
      }
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  onFuelTypeChange(): void {
    this.fuelPrice = this.priceService.getCurrentPrice(this.selectedFuelType);
    this.onInputChange();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  onInputChange(): void {
    this.inputChange$.next();
  }

  private tryAutoCalculate(): void {
    if (
      this.kilometers !== null &&
      this.averageConsumption !== null &&
      this.fuelPrice !== null &&
      this.kilometers > 0 &&
      this.averageConsumption > 0 &&
      this.fuelPrice > 0
    ) {
      this.performCalculation(false);
    }
  }

  calculate(): void {
    this.performCalculation(true);
  }

  private performCalculation(showErrors: boolean): void {
    this.validationErrors = {};
    this.showResult = false;

    if (
      this.kilometers === null ||
      this.averageConsumption === null ||
      this.fuelPrice === null
    ) {
      if (showErrors) {
        this.validationErrors['general'] = this.t('calculator.validation.required');
      }
      return;
    }

    const data: FuelCalculation = {
      kilometers: this.kilometers,
      averageConsumption: this.averageConsumption,
      fuelPrice: this.fuelPrice,
      passengers: this.passengers,
      fuelType: this.selectedFuelType,
      tripName: this.tripName?.trim() || undefined,
    };

    const errorCodes = this.fuelService.getValidationErrors(data);
    if (errorCodes.length > 0) {
      if (showErrors) {
        errorCodes.forEach(code => {
          const fieldMap: Record<string, string> = {
            kilometersMin: 'kilometers',
            consumptionMin: 'consumption',
            priceMin: 'price',
            passengersMin: 'passengers',
          };
          const field = fieldMap[code] ?? 'general';
          this.validationErrors[field] = this.t(`calculator.validation.${code}`);
        });
      }
      return;
    }

    this.isCalculating = true;

    setTimeout(() => {
      this.result = this.fuelService.calculate(data);
      this.showResult = true;
      this.isCalculating = false;
      this.isFavorite = this.fuelService.isFavorite(data);
    }, 350);
  }

  clearForm(): void {
    this.kilometers = null;
    this.averageConsumption = null;
    this.fuelPrice = this.priceService.getCurrentPrice(this.selectedFuelType);
    this.passengers = 1;
    this.selectedFuelType = 'gasoline';
    this.tripName = '';
    this.result = null;
    this.showResult = false;
    this.validationErrors = {};
  }

  onKilometersChange(value: string): void {
    const num = parseFloat(value);
    this.kilometers = isNaN(num) ? null : num;
    this.onInputChange();
  }

  onConsumptionChange(value: string): void {
    const num = parseFloat(value);
    this.averageConsumption = isNaN(num) ? null : num;
    this.onInputChange();
  }

  onPriceChange(value: string): void {
    const num = parseFloat(value);
    this.fuelPrice = isNaN(num) ? null : num;
    this.onInputChange();
  }

  onPassengersChange(value: string): void {
    const num = parseInt(value, 10);
    this.passengers = isNaN(num) ? 1 : Math.max(1, Math.min(20, num));
    this.onInputChange();
  }

  changePassengers(delta: number): void {
    const newValue = this.passengers + delta;
    if (newValue >= 1 && newValue <= 20) {
      this.passengers = newValue;
      this.onInputChange();
    }
  }

  getFuelIcon(fuelId: string): string {
    const icons: Record<string, string> = {
      gasoline: 'flame',
      diesel: 'water-outline',
      electric: 'flash',
      lpg: 'cloud',
    };
    return icons[fuelId] || 'flame';
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  formatLiters(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' L';
  }

  getErrorForField(field: string): string | null {
    return this.validationErrors[field] ?? null;
  }

  async shareResult(): Promise<void> {
    if (!this.result) return;

    const tripLabel = this.tripName?.trim() ? `${this.tripName} | ` : '';
    const text = `${tripLabel}${this.kilometers} km | ${this.averageConsumption} L/100km | Total: ${this.formatCurrency(this.result.totalCost)}${this.passengers > 1 ? ' | ' + this.t('calculator.perPerson') + ': ' + this.formatCurrency(this.result.costPerPerson) : ''}`;

    if (navigator.share) {
      navigator.share({
        title: 'Gasotrip',
        text: text,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      await this.showToast(this.t('calculator.copied'), 'success');
    }
  }

  async saveFavorite(): Promise<void> {
    if (!this.result || !this.kilometers || !this.averageConsumption || !this.fuelPrice) return;

    const data: FuelCalculation = {
      kilometers: this.kilometers,
      averageConsumption: this.averageConsumption,
      fuelPrice: this.fuelPrice,
      passengers: this.passengers,
      fuelType: this.selectedFuelType,
      tripName: this.tripName?.trim() || undefined,
      result: this.result,
      timestamp: Date.now(),
    };

    if (this.isFavorite) {
      this.fuelService.removeFavorite(data.timestamp!);
      this.isFavorite = false;
      await this.showToast(this.t('calculator.favoriteRemoved'), 'medium');
    } else {
      this.fuelService.addFavorite(data);
      this.isFavorite = true;
      await this.showToast(this.t('calculator.favoriteSaved'), 'success');
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      cssClass: 'app-toast',
    });
    await toast.present();
  }
}
