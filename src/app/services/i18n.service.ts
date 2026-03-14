import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly STORAGE_KEY = 'gasotrip_language';
  private currentLanguage = new BehaviorSubject<Language>('es');
  private translations: Translations = {};

  currentLanguage$: Observable<Language> = this.currentLanguage.asObservable();

  constructor() {
    this.loadSavedLanguage();
  }

  private loadSavedLanguage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    if (saved && (saved === 'es' || saved === 'en')) {
      this.currentLanguage.next(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const defaultLang: Language = browserLang === 'en' ? 'en' : 'es';
      this.currentLanguage.next(defaultLang);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.next(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  toggleLanguage(): void {
    const newLang = this.getCurrentLanguage() === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: string | Translations | undefined = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k] as string | Translations | undefined;
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{${paramKey}}`;
      });
    }

    return value;
  }

  setTranslations(translations: Translations): void {
    this.translations = translations;
  }

  getTranslations(): Translations {
    return this.translations;
  }
}
