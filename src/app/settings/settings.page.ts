import { Component, OnInit, inject } from '@angular/core';
import { AppSettingsService, AppSettings } from '../services/app-settings.service';
import { ThemeService } from '../services/theme.service';
import { I18nService, Language, Translations } from '../services/i18n.service';
import { FUEL_TYPES, FuelPrices, DEFAULT_FUEL_PRICES } from '../models/fuel.models';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  settings: AppSettings = {
    theme: 'system',
    language: 'es',
    distanceUnit: 'km',
    fuelPrices: { ...DEFAULT_FUEL_PRICES }
  };

  fuelTypes = FUEL_TYPES;
  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };
  
  appName = 'Gasotrip';
  appVersion = '2.1.0';
  author = 'Abel Segado';
  currentYear = new Date().getFullYear();

  tips = [
    { title: 'Presión neumáticos', icon: 'speedometer-outline', color: 'primary' },
    { title: 'Carga moderada', icon: 'briefcase-outline', color: 'secondary' },
    { title: 'Velocidad constante', icon: 'trending-up-outline', color: 'tertiary' },
    { title: 'Marchas largas', icon: 'cog-outline', color: 'success' }
  ];

  private settingsService = inject(AppSettingsService);
  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadSettings();
    this.updateTips();
  }

  loadSettings(): void {
    this.settings = this.settingsService.getSettings();
  }

  private updateTips(): void {
    this.tips = [
      { title: this.t('info.tip1'), icon: 'speedometer-outline', color: 'primary' },
      { title: this.t('info.tip2'), icon: 'briefcase-outline', color: 'secondary' },
      { title: this.t('info.tip3'), icon: 'trending-up-outline', color: 'tertiary' },
      { title: this.t('info.tip4'), icon: 'cog-outline', color: 'success' }
    ];
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  onThemeChange(): void {
    this.settingsService.updateSettings({ theme: this.settings.theme });
    this.themeService.setTheme(this.settings.theme as any);
  }

  onLanguageChange(): void {
    this.settingsService.updateSettings({ language: this.settings.language });
    this.i18nService.setLanguage(this.settings.language);
    this.currentLang = this.settings.language;
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.updateTips();
  }

  onDistanceUnitChange(): void {
    this.settingsService.updateSettings({ distanceUnit: this.settings.distanceUnit });
  }

  onFuelPriceChange(fuelId: string, value: any): void {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      this.settings.fuelPrices[fuelId] = num;
      this.settingsService.updateSettings({ fuelPrices: this.settings.fuelPrices });
    }
  }

  resetFuelPrices(): void {
    this.settingsService.resetFuelPrices();
    this.loadSettings();
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
}
