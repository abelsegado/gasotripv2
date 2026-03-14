import { Component, OnInit, inject } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { FuelCalculation, FUEL_TYPES } from '../models/fuel.models';
import { FuelCalculationService } from '../services/fuel-calculation.service';
import { I18nService, Language, Translations } from '../services/i18n.service';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  history: FuelCalculation[] = [];
  filteredHistory: FuelCalculation[] = [];
  searchQuery: string = '';
  sortBy: string = 'newest';
  filterFuelType: string = 'all';
  showFilters: boolean = true;
  
  // Edit modal properties - names must match HTML template
  showEditModal = false;
  editItem: FuelCalculation | null = null;
  fuelTypes = FUEL_TYPES;

  // Modal binding variables
  editTripName = '';
  editKilometers: number = 0;
  editConsumption: number = 0;
  editPrice: number = 0;
  editPassengers: number = 1;

  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  private fuelService = inject(FuelCalculationService);
  private alertController = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private i18nService = inject(I18nService);

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadHistory();
  }

  ionViewWillEnter(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
    this.loadHistory();
  }

  loadHistory(): void {
    this.history = this.fuelService.getHistory();
    this.applyFilters();
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  applyFilters(): void {
    let results = [...this.history];

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      results = results.filter(item => 
        (item.tripName && item.tripName.toLowerCase().includes(q)) ||
        item.kilometers.toString().includes(q)
      );
    }

    // Fuel Filter
    if (this.filterFuelType !== 'all') {
      results = results.filter(item => item.fuelType === this.filterFuelType);
    }

    // Sort
    results.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest': return (b.timestamp || 0) - (a.timestamp || 0);
        case 'oldest': return (a.timestamp || 0) - (b.timestamp || 0);
        case 'expensive': return (b.result?.totalCost || 0) - (a.result?.totalCost || 0);
        case 'cheapest': return (a.result?.totalCost || 0) - (b.result?.totalCost || 0);
        default: return 0;
      }
    });

    this.filteredHistory = results;
  }

  onSearchChange(val: string): void {
    this.searchQuery = val;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getTotalKm(): string {
    const total = this.history.reduce((sum, item) => sum + item.kilometers, 0);
    return total.toLocaleString();
  }

  getTotalCost(): string {
    const total = this.history.reduce((sum, item) => sum + (item.result?.totalCost || 0), 0);
    return total.toFixed(2).replace('.', ',') + ' €';
  }

  getTotalLiters(): string {
    const total = this.history.reduce((sum, item) => sum + (item.result?.litersConsumed || 0), 0);
    return total.toFixed(1).replace('.', ',') + ' L';
  }

  async confirmClearHistory(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('history.clearConfirmTitle'),
      message: this.t('history.clearConfirmMessage'),
      buttons: [
        {
          text: this.t('common.cancel'),
          role: 'cancel'
        },
        {
          text: this.t('common.delete'),
          role: 'destructive',
          handler: () => {
            this.fuelService.clearHistory();
            this.loadHistory();
            this.showToast(this.t('history.cleared'), 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteItem(index: number): Promise<void> {
    const timestamp = this.filteredHistory[index].timestamp;
    if (timestamp) {
      const alert = await this.alertController.create({
        header: this.t('common.delete'),
        message: this.t('history.deleteConfirm'),
        buttons: [
          { text: this.t('common.cancel'), role: 'cancel' },
          {
            text: this.t('common.delete'),
            role: 'destructive',
            handler: () => {
              this.fuelService.deleteHistoryItem(timestamp);
              this.loadHistory();
              this.showToast(this.t('history.itemDeleted'), 'medium');
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // Edit Modal Actions
  openEditModal(index: number): void {
    const item = this.filteredHistory[index];
    this.editItem = { ...item };
    this.editTripName = item.tripName || '';
    this.editKilometers = item.kilometers;
    this.editConsumption = item.averageConsumption;
    this.editPrice = item.fuelPrice;
    this.editPassengers = item.passengers;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editItem = null;
  }

  onEditKmChange(val: any): void { this.editKilometers = parseFloat(val); }
  onEditConsChange(val: any): void { this.editConsumption = parseFloat(val); }
  onEditPriceChange(val: any): void { this.editPrice = parseFloat(val); }
  onEditPassChange(val: any): void { this.editPassengers = parseInt(val, 10); }

  changeEditPassengers(delta: number): void {
    const newVal = this.editPassengers + delta;
    if (newVal >= 1) {
      this.editPassengers = newVal;
    }
  }

  saveEditModal(): void {
    if (this.editItem && this.editItem.timestamp) {
      const updates: Partial<FuelCalculation> = {
        tripName: this.editTripName,
        kilometers: this.editKilometers,
        averageConsumption: this.editConsumption,
        fuelPrice: this.editPrice,
        passengers: this.editPassengers
      };
      
      this.fuelService.updateHistoryItem(this.editItem.timestamp, updates);
      this.loadHistory();
      this.closeEditModal();
      this.showToast(this.t('history.itemUpdated'), 'success');
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
      month: 'short',
      year: 'numeric'
    });
  }

  exportToCSV(): void {
    const data = this.history.map(item => ({
      Fecha: this.formatDate(item.timestamp!),
      Nombre: item.tripName || '-',
      Km: item.kilometers,
      Consumo: item.averageConsumption,
      Precio: item.fuelPrice,
      Total: item.result?.totalCost
    }));

    console.table(data);
    this.showToast(this.t('history.exported'), 'success');
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
