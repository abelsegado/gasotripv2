import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {
  currentSlide = 0;
  totalSlides = 4;

  slides: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadSlides();
  }

  loadSlides(): void {
    this.slides = [
      {
        icon: 'car-sport',
        title: this.t('welcome.slide1Title'),
        description: this.t('welcome.slide1Desc'),
      },
      {
        icon: 'calculator',
        title: this.t('welcome.slide2Title'),
        description: this.t('welcome.slide2Desc'),
      },
      {
        icon: 'time',
        title: this.t('welcome.slide3Title'),
        description: this.t('welcome.slide3Desc'),
      },
      {
        icon: 'flash',
        title: this.t('welcome.slide4Title'),
        description: this.t('welcome.slide4Desc'),
      },
    ];
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  next(): void {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    } else {
      this.close();
    }
  }

  prev(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss(true);
  }
}
