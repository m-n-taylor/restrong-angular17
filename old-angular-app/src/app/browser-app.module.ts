import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { BrowserTransferStateModule } from '../modules/transfer-state/browser-transfer-state.module';

// 3rd Party Libs
import Chart from 'chart.js';
import * as moment from 'moment';
import * as Swiper from 'swiper';
const Flatpickr = require("flatpickr");

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({
      appId: 'my-app-id'
    }),
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    AppModule
  ]
})
export class BrowserAppModule {
  /**
   * BrowserAppModule
   */
  constructor() {

    // Chart JS
    window['Chart'] = Chart;
    
    // Flatpickr
    window['Flatpickr'] = Flatpickr;

    // PDF make
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    // Swiper
    window['Swiper'] = Swiper;
  }
}
