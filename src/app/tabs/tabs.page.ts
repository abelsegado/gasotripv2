import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { I18nService, Language } from '../services/i18n.service';
import enTranslations from '../../assets/i18n/en.json';
import esTranslations from '../../assets/i18n/es.json';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  isDarkMode = false;
  currentLang: Language = 'es';
  translations: any = {
    en: enTranslations,
    es: esTranslations,
  };

  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);

  constructor() {}

  ngOnInit(): void {
    this.updateThemeState();
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.t(key, params);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.updateThemeState();
  }

  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.setTranslations(this.translations[this.currentLang]);
  }

  private updateThemeState(): void {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }
}
