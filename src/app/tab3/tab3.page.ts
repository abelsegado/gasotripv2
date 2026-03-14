import { Component, OnInit, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FuelCalculation } from '../models/fuel.models';
import { FuelCalculationService } from '../services/fuel-calculation.service';
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
  
  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  private fuelService = inject(FuelCalculationService);
  private alertController = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private i18nService = inject(I18nService);

  constructor() {}

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

  loadFavorites(): void {
    this.favorites = this.fuelService.getFavorites();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  async loadTrip(item: FuelCalculation): Promise<void> {
    // Para cargar el viaje, lo pasamos a la pestaña 1 a través de un servicio o estado simple
    // Aquí usaremos sessionStorage para simplificar, la pestaña 1 lo recogerá en ionViewWillEnter
    sessionStorage.setItem('gasotrip_load_trip', JSON.stringify(item));
    await this.router.navigate(['/tabs/tab1']);
    await this.showToast(this.t('favorites.tripLoaded'), 'success');
  }

  async confirmDelete(index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('favorites.deleteConfirmTitle'),
      message: this.t('favorites.deleteConfirmMessage'),
      buttons: [
        {
          text: this.t('common.cancel'),
          role: 'cancel'
        },
        {
          text: this.t('common.delete'),
          role: 'destructive',
          handler: () => {
            this.deleteFavorite(index);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteFavorite(index: number): void {
    const timestamp = this.favorites[index].timestamp;
    if (timestamp) {
      this.fuelService.removeFavorite(timestamp);
      this.loadFavorites();
      this.showToast(this.t('favorites.deleted'), 'medium');
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

  getFuelName(fuelId: string): string {
    return this.t(`calculator.fuelTypes.${fuelId}`);
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(this.currentLang === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: 'short'
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      cssClass: 'app-toast'
    });
    await toast.present();
  }
}
