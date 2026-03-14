import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FuelCalculationService } from '../services/fuel-calculation.service';
import { FuelCalculation, FUEL_TYPES } from '../models/fuel.models';
import { I18nService, Language, Translations } from '../services/i18n.service';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  favorites: FuelCalculation[] = [];
  fuelTypes = FUEL_TYPES;

  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  constructor(
    private fuelService: FuelCalculationService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadFavorites();
  }

  ionViewWillEnter(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadFavorites();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  loadFavorites(): void {
    this.favorites = this.fuelService.getFavorites();
  }

  getFuelName(fuelTypeId: string): string {
    const fuel = FUEL_TYPES.find((f) => f.id === fuelTypeId);
    return fuel ? fuel.name : fuelTypeId;
  }

  getFuelIcon(fuelTypeId: string): string {
    const icons: Record<string, string> = {
      gasoline: 'flame',
      diesel: 'water-outline',
      electric: 'flash',
      lpg: 'cloud',
    };
    return icons[fuelTypeId] || 'flame';
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(
      this.currentLang === 'es' ? 'es-ES' : 'en-GB',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  }

  loadTrip(favorite: FuelCalculation): void {
    // Store the selected favorite in sessionStorage so Tab1 can pick it up
    sessionStorage.setItem('gasotrip_load_trip', JSON.stringify(favorite));
    this.router.navigate(['/tabs/tab1']);
  }

  async confirmDelete(index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('favorites.deleteConfirmTitle'),
      message: this.t('favorites.deleteConfirmMessage'),
      buttons: [
        { text: this.t('favorites.cancel'), role: 'cancel' },
        {
          text: this.t('favorites.delete'),
          role: 'destructive',
          handler: () => { this.deleteFavorite(index); },
        },
      ],
    });
    await alert.present();
  }

  deleteFavorite(index: number): void {
    const item = this.favorites[index];
    if (item.timestamp) {
      this.fuelService.removeFavorite(item.timestamp);
      this.favorites.splice(index, 1);
    }
  }
}
