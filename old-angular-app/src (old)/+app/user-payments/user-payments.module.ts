import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { AddUserPaymentModalModule } from '../shared/components/add-user-payment-modal/add-user-payment-modal.module';
import { UserPaymentsComponent } from './user-payments.component';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    AddUserPaymentModalModule
  ],
  declarations: [
    UserPaymentsComponent
  ]
})
export class UserPaymentsModule { }
