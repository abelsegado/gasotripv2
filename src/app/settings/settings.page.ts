import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AppSettings, AppSettingsService } from '../services/app-settings.service';
import { ThemeService } from '../services/theme.service';
import { I18nService, Language, Translations } from '../services/i18n.service';
import { FUEL_TYPES, DEFAULT_FUEL_PRICES } from '../models/fuel.models';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

interface Tip { icon: string; title: string; description: string; color: string; }
interface Feature { icon: string; text: string; }

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  settings: AppSettings;
  fuelTypes = FUEL_TYPES;
  currentYear = new Date().getFullYear();
  appVersion = '1.1.0';
  appName = 'Gasotrip';
  author = 'Abel Segado';

  tips: Tip[] = [];
  features: Feature[] = [];

  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  constructor(
    private settingsService: AppSettingsService,
    private themeService: ThemeService,
    private i18nService: I18nService,
    private toastCtrl: ToastController
  ) {
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadTipsAndFeatures();
  }

  ionViewWillEnter(): void {
    this.settings = this.settingsService.getSettings();
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadTipsAndFeatures();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  async onThemeChange(): Promise<void> {
    this.settingsService.updateSettings({ theme: this.settings.theme });
    if (this.settings.theme === 'dark') {
      this.themeService.setTheme('dark');
    } else {
      this.themeService.setTheme('light');
    }
    await this.showToast(this.t('settings.saveSuccess'));
  }

  async onLanguageChange(): Promise<void> {
    this.settingsService.updateSettings({ language: this.settings.language });
    this.i18nService.setLanguage(this.settings.language);
    this.currentLang = this.settings.language;
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadTipsAndFeatures();
    await this.showToast(this.t('settings.saveSuccess'));
  }

  async onDistanceUnitChange(): Promise<void> {
    this.settingsService.updateSettings({ distanceUnit: this.settings.distanceUnit });
    await this.showToast(this.t('settings.saveSuccess'));
  }

  async onFuelPriceChange(fuelType: string, value: string): Promise<void> {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      this.settings.fuelPrices[fuelType] = num;
      this.settingsService.updateSettings({ fuelPrices: { ...this.settings.fuelPrices } });
    }
  }

  async resetFuelPrices(): Promise<void> {
    this.settingsService.resetFuelPrices();
    this.settings = this.settingsService.getSettings();
    await this.showToast(this.t('settings.saveSuccess'));
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  loadTipsAndFeatures(): void {
    this.tips = [
      { icon: 'speedometer', title: this.t('tips.smoothDriving'), description: this.t('tips.smoothDrivingDesc'), color: 'primary' },
      { icon: 'navigate', title: this.t('tips.speed'), description: this.t('tips.speedDesc'), color: 'secondary' },
      { icon: 'snow', title: this.t('tips.useAc'), description: this.t('tips.useAcDesc'), color: 'tertiary' },
      { icon: 'cube', title: this.t('tips.reduceWeight'), description: this.t('tips.reduceWeightDesc'), color: 'primary' },
      { icon: 'analytics', title: this.t('tips.maintainTires'), description: this.t('tips.maintainTiresDesc'), color: 'secondary' },
      { icon: 'flash', title: this.t('tips.idle'), description: this.t('tips.idleDesc'), color: 'tertiary' },
    ];

    this.features = [
      { icon: 'calculator', text: this.t('features.multiFuel') },
      { icon: 'time', text: this.t('features.history') },
      { icon: 'bookmark', text: this.t('features.favorites') },
      { icon: 'download', text: this.t('features.share') },
      { icon: 'moon', text: this.t('features.darkMode') },
      { icon: 'language', text: this.t('language.select') },
    ];
  }
}
