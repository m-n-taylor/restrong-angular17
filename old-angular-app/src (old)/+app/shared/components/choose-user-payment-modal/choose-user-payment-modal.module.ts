import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../../shared.module';
import { FiltersComponent } from '../../components/filters/filters.component';
import { ChooseUserPaymentModalComponent } from './choose-user-payment-modal.component';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
  ],
  declarations: [
    ChooseUserPaymentModalComponent
  ],
  exports: [
    ChooseUserPaymentModalComponent
  ]
})
export class ChooseUserPaymentModalModule { }