import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NetworkService, NetworkStatus } from './services/network.service';
import { WelcomeService } from './services/welcome.service';
import { ModalController } from '@ionic/angular';
import { WelcomePage } from './welcome/welcome.page';
import { Subscription } from 'rxjs';
import { I18nService } from './services/i18n.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  isOnline = true;
  private networkSub?: Subscription;

  private networkService = inject(NetworkService);
  private welcomeService = inject(WelcomeService);
  private modalCtrl = inject(ModalController);
  private i18nService = inject(I18nService);

  constructor() {}

  t(key: string): string {
    return this.i18nService.t(key);
  }

  ngOnInit(): void {
    this.isOnline = this.networkService.isOnline;
    this.networkSub = this.networkService.status$.subscribe((status: NetworkStatus) => {
      this.isOnline = status === 'online';
    });

    this.showWelcomeIfFirstVisit();
  }

  private async showWelcomeIfFirstVisit(): Promise<void> {
    if (this.welcomeService.isFirstVisit()) {
      setTimeout(async () => {
        const modal = await this.modalCtrl.create({
          component: WelcomePage,
          cssClass: 'welcome-modal',
          backdropDismiss: false,
          showBackdrop: true,
        });
        await modal.present();
        this.welcomeService.markWelcomeShown();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }
}
