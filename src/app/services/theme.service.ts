import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'gasotrip_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkTheme = 'dark-theme';
  private lightTheme = 'light-theme';

  constructor() {
    this.initTheme();
    this.setupSystemThemeListener();
  }

  private initTheme(): void {
    const savedTheme = this.getSavedTheme();
    this.applyTheme(savedTheme);
  }

  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const savedTheme = this.getSavedTheme();
      if (savedTheme === 'system') {
        this.applyTheme('system');
      }
    });
  }

  getSavedTheme(): Theme {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (error) {
      console.error('Error reading theme:', error);
    }
    return 'system';
  }

  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    body.classList.remove(this.darkTheme, this.lightTheme);

    let isDark = false;

    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      body.classList.add(this.darkTheme);
    } else {
      body.classList.add(this.lightTheme);
    }
  }

  getCurrentTheme(): Theme {
    const darkClass = document.body.classList.contains(this.darkTheme);
    if (darkClass) {
      return 'dark';
    }
    return 'light';
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }
}
