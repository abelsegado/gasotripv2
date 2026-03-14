import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WelcomePage } from './welcome.page';

@NgModule({
  declarations: [WelcomePage],
  imports: [
    CommonModule,
    IonicModule,
  ],
})
export class WelcomeModule {}
