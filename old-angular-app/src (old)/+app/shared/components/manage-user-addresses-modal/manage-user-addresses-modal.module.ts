import { NgModule } from '@angular/core';

import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { SharedModule } from '../../shared.module';
import { FiltersComponent } from '../../components/filters/filters.component';
import { ManageUserAddressesModalComponent } from './manage-user-addresses-modal.component';

@NgModule({
  imports: [
    InfiniteScrollModule,
    SharedModule,
  ],
  declarations: [
    ManageUserAddressesModalComponent
  ],
  exports: [
    ManageUserAddressesModalComponent
  ]
})
export class ManageUserAddressesModalModule { }