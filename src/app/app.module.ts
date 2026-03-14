import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeModule } from './welcome/welcome.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { I18nService } from './services/i18n.service';
import { ThemeService } from './services/theme.service';
import { AppSettingsService } from './services/app-settings.service';
import { FuelCalculationService } from './services/fuel-calculation.service';
import { FuelPriceService } from './services/fuel-price.service';
import { WelcomeService } from './services/welcome.service';
import { NetworkService } from './services/network.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    IonicModule.forRoot(), 
    AppRoutingModule, 
    WelcomeModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    I18nService,
    ThemeService,
    AppSettingsService,
    FuelCalculationService,
    FuelPriceService,
    WelcomeService,
    NetworkService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
