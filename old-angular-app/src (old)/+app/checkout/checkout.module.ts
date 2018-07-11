import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../shared/shared.module';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { CheckoutComponent } from './checkout.component';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { ManageUserAddressesModalModule } from '../shared/components/manage-user-addresses-modal/manage-user-addresses-modal.module';
import { ChooseUserPaymentModalModule } from '../shared/components/choose-user-payment-modal/choose-user-payment-modal.module';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
    CheckoutRoutingModule,
    ManageUserAddressesModalModule,
    ChooseUserPaymentModalModule
  ],
  declarations: [
    CheckoutComponent
  ]
})
export class CheckoutModule { }
