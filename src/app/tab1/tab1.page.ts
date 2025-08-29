import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  kilometros: number = 0;
  consumoMedio: number = 0;
  precioGasolina: number = 0;
  integrantes: number = 1;

  litrosConsumidos: number = 0;
  costeTotal: number = 0;
  costePorPersona: number = 0;
  resultadoMostrado: boolean = false;

  constructor() { }

  calcularGasolina() {
    if (
      this.kilometros > 0 &&
      this.consumoMedio > 0 &&
      this.precioGasolina > 0 &&
      this.integrantes > 0
    ) {
      this.litrosConsumidos = (this.kilometros * this.consumoMedio) / 100;
      this.costeTotal = this.litrosConsumidos * this.precioGasolina;
      this.costePorPersona = this.costeTotal / this.integrantes;
      this.resultadoMostrado = true;
    } else {
      this.resultadoMostrado = false;
    }
  }

}
