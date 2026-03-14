import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FuelCalculationService } from '../services/fuel-calculation.service';
import { FuelCalculation, FUEL_TYPES } from '../models/fuel.models';
import { I18nService, Language, Translations } from '../services/i18n.service';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

type SortOption = 'newest' | 'oldest' | 'expensive' | 'cheapest';
type FilterFuelType = 'all' | 'gasoline' | 'diesel' | 'electric' | 'lpg';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  history: FuelCalculation[] = [];
  filteredHistory: FuelCalculation[] = [];

  sortBy: SortOption = 'newest';
  filterFuelType: FilterFuelType = 'all';
  showFilters = false;
  searchQuery = '';

  fuelTypes = FUEL_TYPES;
  currentLang: Language = 'es';
  translations: Record<string, Translations> = {
    en: enTranslations as unknown as Translations,
    es: esTranslations as unknown as Translations,
  };

  // Edit modal state
  showEditModal = false;
  editItem: FuelCalculation | null = null;
  editKilometers: number | null = null;
  editConsumption: number | null = null;
  editPrice: number | null = null;
  editPassengers: number = 1;
  editTripName: string = '';

  constructor(
    private fuelService: FuelCalculationService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
  }

  ionViewWillEnter(): void {
    this.loadHistory();
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  loadHistory(): void {
    this.history = this.fuelService.getHistory();
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.history];

    if (this.filterFuelType !== 'all') {
      result = result.filter(item => item.fuelType === this.filterFuelType);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.tripName?.toLowerCase().includes(q)) ||
        item.kilometers.toString().includes(q) ||
        this.getFuelName(item.fuelType).toLowerCase().includes(q)
      );
    }

    switch (this.sortBy) {
      case 'newest':
        result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        break;
      case 'oldest':
        result.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        break;
      case 'expensive':
        result.sort((a, b) => (b.result?.totalCost || 0) - (a.result?.totalCost || 0));
        break;
      case 'cheapest':
        result.sort((a, b) => (a.result?.totalCost || 0) - (b.result?.totalCost || 0));
        break;
    }

    this.filteredHistory = result;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.applyFilters();
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

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const mins = Math.floor(diffMs / (1000 * 60));
      return this.currentLang === 'es' ? `Hace ${mins} min` : `${mins} min ago`;
    } else if (diffHours < 24) {
      return this.currentLang === 'es' ? `Hace ${diffHours} h` : `${diffHours} h ago`;
    } else if (diffDays < 7) {
      return this.currentLang === 'es' ? `Hace ${diffDays} días` : `${diffDays} days ago`;
    }

    return date.toLocaleDateString(this.currentLang === 'es' ? 'es-ES' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  formatLiters(value: number): string {
    return value.toFixed(1).replace('.', ',') + ' L';
  }

  getTotalKm(): string {
    const total = this.filteredHistory.reduce((sum, item) => sum + item.kilometers, 0);
    return total.toFixed(0) + ' km';
  }

  getTotalCost(): string {
    const total = this.filteredHistory.reduce((sum, item) => sum + (item.result?.totalCost ?? 0), 0);
    return total.toFixed(2).replace('.', ',') + ' €';
  }

  getTotalLiters(): string {
    const total = this.filteredHistory.reduce((sum, item) => sum + (item.result?.litersConsumed ?? 0), 0);
    return total.toFixed(1).replace('.', ',') + ' L';
  }

  async exportToCSV(): Promise<void> {
    if (this.filteredHistory.length === 0) return;

    const lang = this.currentLang;
    const headers = lang === 'es'
      ? ['Fecha', 'Nombre', 'Tipo', 'Kilómetros', 'Consumo', 'Precio', 'Pasajeros', 'Litros', 'Coste Total', 'Coste Persona']
      : ['Date', 'Name', 'Type', 'Kilometers', 'Consumption', 'Price', 'Passengers', 'Liters', 'Total Cost', 'Cost Per Person'];

    const rows = this.filteredHistory.map(item => [
      new Date(item.timestamp!).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB'),
      item.tripName ?? '',
      this.getFuelName(item.fuelType),
      item.kilometers.toString(),
      item.averageConsumption.toString(),
      item.fuelPrice.toString(),
      item.passengers.toString(),
      item.result!.litersConsumed.toFixed(2),
      item.result!.totalCost.toFixed(2),
      item.result!.costPerPerson.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gasotrip_historial_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    await this.showToast(this.t('history.exportSuccess'), 'success');
  }

  // ─── Edit modal ───────────────────────────────────────────────
  openEditModal(index: number): void {
    this.editItem = { ...this.filteredHistory[index] };
    this.editKilometers = this.editItem.kilometers;
    this.editConsumption = this.editItem.averageConsumption;
    this.editPrice = this.editItem.fuelPrice;
    this.editPassengers = this.editItem.passengers;
    this.editTripName = this.editItem.tripName ?? '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editItem = null;
  }

  saveEditModal(): void {
    if (!this.editItem?.timestamp) return;
    const updates: Partial<FuelCalculation> = {
      kilometers: this.editKilometers ?? this.editItem.kilometers,
      averageConsumption: this.editConsumption ?? this.editItem.averageConsumption,
      fuelPrice: this.editPrice ?? this.editItem.fuelPrice,
      passengers: this.editPassengers,
      tripName: this.editTripName?.trim() || undefined,
    };
    this.fuelService.updateHistoryItem(this.editItem.timestamp, updates);
    this.closeEditModal();
    this.loadHistory();
    this.showToast(this.t('history.editSave'), 'success');
  }

  changeEditPassengers(delta: number): void {
    const newV = this.editPassengers + delta;
    if (newV >= 1 && newV <= 20) {
      this.editPassengers = newV;
    }
  }

  onEditKmChange(v: string): void { this.editKilometers = parseFloat(v) || null; }
  onEditConsChange(v: string): void { this.editConsumption = parseFloat(v) || null; }
  onEditPriceChange(v: string): void { this.editPrice = parseFloat(v) || null; }
  onEditPassChange(v: string): void {
    const n = parseInt(v, 10);
    this.editPassengers = isNaN(n) ? 1 : Math.max(1, Math.min(20, n));
  }
  // ─────────────────────────────────────────────────────────────

  async confirmClearHistory(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('history.clearConfirmTitle'),
      message: this.t('history.clearConfirmMessage'),
      buttons: [
        { text: this.t('history.cancel'), role: 'cancel' },
        {
          text: this.t('history.clear'),
          role: 'destructive',
          handler: () => { this.clearHistory(); },
        },
      ],
    });
    await alert.present();
  }

  clearHistory(): void {
    this.fuelService.clearHistory();
    this.history = [];
    this.filteredHistory = [];
  }

  async confirmDeleteItem(index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: this.t('history.deleteConfirmTitle'),
      message: this.t('history.deleteConfirmMessage'),
      buttons: [
        { text: this.t('history.cancel'), role: 'cancel' },
        {
          text: this.t('history.delete'),
          role: 'destructive',
          handler: () => { this.deleteItem(index); },
        },
      ],
    });
    await alert.present();
  }

  deleteItem(index: number): void {
    const itemToRemove = this.filteredHistory[index];
    const originalIndex = this.history.findIndex(item => item.timestamp === itemToRemove.timestamp);
    if (originalIndex > -1) {
      this.history.splice(originalIndex, 1);
      this.filteredHistory.splice(index, 1);
      this.fuelService.clearHistory();
      this.history.forEach(h => this.fuelService.addFavorite(h)); // keep favorites intact
      // Re-save history properly
      localStorage.setItem('gasotrip_history', JSON.stringify(this.history));
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
